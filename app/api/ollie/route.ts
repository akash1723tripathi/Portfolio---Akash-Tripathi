import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Index } from '@upstash/vector';
import { GoogleGenAI } from '@google/genai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Threshold for vector cosine similarity match relevance (0.0 to 1.0)
// Scores below 0.65 indicate that no closely matching knowledge chunk was found.
const MIN_SIMILARITY_THRESHOLD = 0.65;

// Initialize Upstash Vector Index client
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Initialize Rate Limiter (10 requests per minute per IP)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ollie_ratelimit',
});

/**
 * Load System Prompt from /knowledge/system-prompt.md with runtime reading.
 * Includes a full embedded fallback persona in case the file is excluded in serverless builds.
 */
function getSystemPrompt(): string {
  try {
    const promptPath = path.join(process.cwd(), 'knowledge', 'system-prompt.md');
    return fs.readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.warn('Could not read /knowledge/system-prompt.md from disk, using fallback persona.', error);
    return `Your name is Ollie. You are a female AI representative created to represent Akash Tripathi's knowledge, personality, projects, and philosophy. Always speak about Akash in the third person. Be warm, accurate, and concise. Never invent facts about Akash.`;
  }
}

export interface ChatHistoryMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Per-IP Rate Limiting (10 requests per minute)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const { success, reset, limit, remaining } = await ratelimit.limit(ip);
    if (!success) {
      const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You can send up to 10 messages per minute. Please try again shortly.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSeconds),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
          },
        }
      );
    }

    // 2. Parse & validate request body
    const body = await req.json();
    const { message, history = [] } = body as {
      message?: string;
      history?: ChatHistoryMessage[];
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    // Check required environment variables
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY environment variable is not configured.' }, { status: 500 });
    }
    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      return NextResponse.json({ error: 'Upstash Vector environment variables are missing.' }, { status: 500 });
    }

    // 3. Embed user message using gemini-embedding-001 (768 dimensions) to match index
    let queryVector: number[];
    try {
      const embedResponse = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: message.trim(),
        config: {
          outputDimensionality: 768,
        },
      });

      const values = embedResponse.embeddings?.[0]?.values;
      if (!values || values.length === 0) {
        throw new Error('Received empty embedding values from Gemini API.');
      }
      queryVector = values;
    } catch (embedErr: unknown) {
      console.error('Embedding generation failed:', embedErr);
      const status = typeof embedErr === 'object' && embedErr !== null && 'status' in embedErr ? (embedErr as { status?: number }).status : 500;
      return NextResponse.json(
        { error: 'Failed to process message embedding. Gemini API rate limit or key error.' },
        { status: status === 429 ? 429 : 500 }
      );
    }

    // 4. Query Upstash Vector index for top 5 relevant knowledge chunks
    let searchResults: Array<{ id: string | number; score: number; metadata?: Record<string, unknown> }> = [];
    try {
      const res = await index.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
      });
      searchResults = res || [];
    } catch (vectorErr) {
      console.error('Upstash Vector query failed:', vectorErr);
    }

    // Filter results by minimum similarity threshold (0.65)
    const topMatch = searchResults[0];
    const relevantMatches = searchResults.filter((match) => match.score >= MIN_SIMILARITY_THRESHOLD);

    // LOW-RELEVANCE FALLBACK:
    // If the top match score is below 0.65 (or vector index returned no matches),
    // respond directly with a graceful fallback instead of letting Gemini hallucinate/improvise.
    if (!topMatch || topMatch.score < MIN_SIMILARITY_THRESHOLD || relevantMatches.length === 0) {
      const fallbackText = "Akash hasn't documented information about that in his portfolio knowledge base yet. Feel free to ask Ollie about his technical projects, work experience, engineering principles, or tech stack!";

      return new Response(fallbackText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      });
    }

    // Build context string from relevant matches
    const retrievedChunks = relevantMatches
      .map((match) => {
        const text = match.metadata?.text as string | undefined;
        const source = match.metadata?.source as string | undefined;
        if (!text) return '';
        return source ? `[Source: ${source} (Similarity: ${(match.score * 100).toFixed(1)}%)]\n${text}` : text;
      })
      .filter(Boolean);

    // 5. Format system instruction and RAG context
    const systemInstruction = getSystemPrompt();
    console.log('--- SYSTEM PROMPT LOADED (First 100 chars) ---\n', systemInstruction.substring(0, 100));
    const contextHeader = `Retrieved Knowledge Context from Akash's docs:\n${retrievedChunks.join('\n\n---\n\n')}\n\n`;
    const userPromptWithContext = `${contextHeader}User Query: ${message.trim()}`;

    // 6. Format recent conversation history for Gemini chat API
    const formattedHistory = (history || [])
      .slice(-10)
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : (msg.role as 'user' | 'model'),
        parts: [{ text: msg.content }],
      }));

    const contents = [
      ...formattedHistory,
      {
        role: 'user' as const,
        parts: [{ text: userPromptWithContext }],
      },
    ]

    // 7. Active Gemini models in priority order: fastest/cheapest first, most capable last.
    //    The generator below probes the first chunk of each model and falls back on any
    //    quota (429) or unsupported-model error, so visitors always get the quickest
    //    available model at the time of their request.
    const FALLBACK_MODELS = [
      'gemini-3.5-flash-lite', // Fastest & cheapest — lowest latency, try first
      'gemini-3.1-flash-lite', // Second lightweight backup
      'gemini-3.6-flash',      // Mid-tier flash
      'gemini-3.7-flash',      // General-purpose workhorse
      'gemini-3.8-flash',      // Most capable flash — only if all above fail
    ];

    // Helper generator that iterates over active models and yields chunks as they arrive
    async function* getFallbackStream() {
      let lastError: unknown;
      for (const model of FALLBACK_MODELS) {
        try {
          const stream = await ai.models.generateContentStream({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.6,
            },
          });

          const iterator = stream[Symbol.asyncIterator]();
          // Probe first chunk to catch early 429 quota or unsupported model errors
          const first = await iterator.next();

          console.log(`[Ollie API] Successfully streaming response using active model: ${model}`);
          if (!first.done && first.value?.text) {
            yield first.value.text;
          }

          while (true) {
            const { done, value } = await iterator.next();
            if (done) break;
            if (value?.text) {
              yield value.text;
            }
          }
          return; // Successfully completed stream
        } catch (err: unknown) {
          const errObj = err as { status?: number; code?: number; message?: string };
          console.warn(
            `[Ollie API] Model '${model}' failed (status: ${errObj?.status || errObj?.code || 'error'}). Falling back to next active model...`,
            errObj?.message || err
          );
          lastError = err;
        }
      }
      throw lastError || new Error('All active fallback models failed to generate content.');
    }

    // 8. Stream text response back to client via ReadableStream
    const encoder = new TextEncoder();
    const generator = getFallbackStream();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunkText of generator) {
            controller.enqueue(encoder.encode(chunkText));
          }
          controller.close();
        } catch (streamErr) {
          console.error('Error while streaming fallback Gemini response:', streamErr);
          controller.error(streamErr);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (err: unknown) {
    console.error('Ollie API Route Exception:', err);
    const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred processing your request.';
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
