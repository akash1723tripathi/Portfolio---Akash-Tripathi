/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Index } = require('@upstash/vector');
const { GoogleGenAI } = require('@google/genai');

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// recursively get all .md files, skip system-prompt.md (that's not for retrieval)
function getMdFiles(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getMdFiles(fullPath));
    } else if (entry.name.endsWith('.md') && entry.name !== 'system-prompt.md') {
      files.push(fullPath);
    }
  }
  return files;
}

// split by ## headings into chunks
function chunkContent(content, source) {
  const sections = content.split(/\n(?=## )/).filter(s => s.trim());
  return sections.map((section, i) => ({
    id: `${source}-${i}`,
    text: section.trim(),
    source,
  }));
}

async function embedText(text) {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return result.embeddings[0].values;
}

async function embedAndUpsert() {
  const files = getMdFiles(path.join(__dirname, '../knowledge'));
  let totalChunks = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const sourceName = path.relative(path.join(__dirname, '../knowledge'), file);
    const chunks = chunkContent(content, sourceName);

    for (const chunk of chunks) {
      const vector = await embedText(chunk.text);

      await index.upsert({
        id: chunk.id,
        vector,
        metadata: { text: chunk.text, source: chunk.source },
      });
      totalChunks++;
      console.log(`Embedded: ${chunk.id}`);
    }
  }

  console.log(`Done. ${totalChunks} chunks embedded from ${files.length} files.`);
}

embedAndUpsert().catch(console.error);