'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '@/components/prompt-kit/prompt-input';
import { Button } from '@/components/ui/button';
import { ArrowUp, Square } from 'lucide-react';
import {
  ChainOfThought,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  ChainOfThoughtContent,
  ChainOfThoughtItem,
} from '@/components/prompt-kit/chain-of-thought';
import { useTransition } from '@/components/transitions';
import styles from './OllieChatbot.module.css';

export interface ThoughtStep {
  title: string;
  items: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thoughtSteps?: ThoughtStep[];
  isThinking?: boolean;
}

const INITIAL_GREETING =
  "Hi! I'm Ollie, Akash's personal AI assistant. How can I help you today?";

const SUGGESTIONS = [
  'What projects has Akash built?',
  "Tell me about Akash's tech stack",
  'How can I get in touch with Akash?',
];

export const OllieChatbot: React.FC = () => {
  const { isTransitioning } = useTransition();
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting-1',
      role: 'assistant',
      content: INITIAL_GREETING,
    },
  ]);

  const messageListRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Listen for navbar menu state changes
  useEffect(() => {
    const handleMenuChange = (e: Event) => {
      const customEv = e as CustomEvent<{ open: boolean }>;
      setIsNavMenuOpen(customEv.detail?.open ?? false);
    };
    window.addEventListener('navbar-menu-change', handleMenuChange);
    return () => window.removeEventListener('navbar-menu-change', handleMenuChange);
  }, []);

  // Auto-scroll message container to bottom on message update
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Isolate scroll from main browser viewport (Lenis & native) when hovering/scrolling over chat
  useEffect(() => {
    const el = chatWindowRef.current;
    if (!el) return;

    const stopWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', stopWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', stopWheel);
    };
  }, [isOpen]);

  // Cycle through active reasoning steps while Ollie is thinking
  useEffect(() => {
    if (!isLoading) {
      setActiveStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < 2 ? prev + 1 : prev));
    }, 700);

    return () => clearInterval(interval);
  }, [isLoading]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isThinking ? { ...msg, isThinking: false } : msg))
    );
  };

  const handleSend = async (customMessage?: string) => {
    const textToSend = (customMessage || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
    };

    // Format chat history for API (up to last 10 messages)
    const historyPayload = messages.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setIsLoading(true);
    setActiveStepIndex(0);

    const initialThoughtSteps: ThoughtStep[] = [
      {
        title: "Analyzing the user's request",
        items: [
          `Query: "${textToSend.substring(0, 42)}${textToSend.length > 42 ? '...' : ''}"`,
          'Generating 768-dimensional semantic embedding...',
        ],
      },
      {
        title: 'Searching vector knowledge base',
        items: [
          'Querying Upstash Vector index for relevant chunks',
          'Filtering matches with cosine similarity score >= 0.65',
        ],
      },
      {
        title: 'Formulating response',
        items: [
          'Constructing grounded prompt with verified context',
          'Streaming response with Ollie persona...',
        ],
      },
    ];

    try {
      // Append placeholder assistant message with active ChainOfThought
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          thoughtSteps: initialThoughtSteps,
          isThinking: true,
        },
      ]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch('/api/ollie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMsg = 'Failed to connect to Ollie.';
        try {
          const errJson = await res.json();
          errorMsg = errJson.error || errorMsg;
        } catch {
          // ignore parsing error if response was plain text
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                ...msg,
                isThinking: false,
                content: `⚠️ ${errorMsg}`,
              }
              : msg
          )
        );
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                ...msg,
                isThinking: false,
                content: 'Failed to read response stream.',
              }
              : msg
          )
        );
        setIsLoading(false);
        return;
      }

      let accumulated = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        if (isFirstChunk) {
          isFirstChunk = false;
          // Once Ollie starts answering, chain of thought is dismissed!
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                  ...msg,
                  isThinking: false,
                  content: accumulated,
                }
                : msg
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulated }
                : msg
            )
          );
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Handled by handleStop
        return;
      }
      console.error('Error fetching Ollie response:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId && !msg.content
            ? {
              ...msg,
              isThinking: false,
              content: 'Sorry, I encountered an unexpected network error.',
            }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Helper to render bold markdown and clean bullet lists
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: '6px' }} />;
      }

      // Check for bullet list lines
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.replace(/^[-•*]\s+/, '');
        return (
          <div key={idx} className={styles.messageBullet}>
            <span className={styles.bulletDot}>•</span>
            <span>{renderInlineBold(itemText)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={styles.messageParagraph}>
          {renderInlineBold(line)}
        </p>
      );
    });
  };

  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const shouldSlideOut = isNavMenuOpen || isTransitioning;

  return (
    <div
      className={`${styles.chatbotContainer} ${
        shouldSlideOut ? styles.slideOut : styles.slideIn
      }`}
    >
      {/* Floating trigger button showing Ollie's face overlay */}
      {!isOpen && (
        <button
          type="button"
          className={styles.triggerButton}
          onClick={toggleOpen}
          aria-label="Open Ollie AI Assistant"
        >
          <img
            src="/assets/hello-kitty/Firefly_RemoveBackground.png"
            alt="Ollie AI Assistant"
            className={`${styles.avatarOverlay} ${styles.lightAvatar}`}
          />
          <img
            src="/assets/hello-kitty/Firefly_RemoveBackground.png"
            alt="Ollie AI Assistant"
            className={`${styles.avatarOverlay} ${styles.darkAvatar}`}
          />
          <span className={styles.badgeTooltip}>Ask Ollie</span>
        </button>
      )}

      {/* Expanded chatting application window */}
      <div
        ref={chatWindowRef}
        data-lenis-prevent="true"
        className={`${styles.chatWindow} ${isOpen ? styles.chatWindowOpen : styles.chatWindowClosed
          }`}
        aria-hidden={!isOpen}
      >
        {/* Header - green dot removed as requested */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.headerAvatarWrapper}>
              <img
                src="/assets/hello-kitty/chat-face.jpg"
                alt="Ollie"
                className={styles.headerAvatar}
              />
            </div>
            <div>
              <h3 className={styles.headerTitle}>Ollie</h3>
              <p className={styles.headerSubtitle}>
                Akash Tripathi&apos;s Personal AI Assistant
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={toggleOpen}
            aria-label="Close Chat"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Chat Message List - Isolated Scroll with data-lenis-prevent */}
        <div
          className={styles.messageList}
          ref={messageListRef}
          data-lenis-prevent="true"
        >
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              {/* Chain of Thought: rendered OUTSIDE the bubble, directly in message flow */}
              {msg.role === 'assistant' && msg.isThinking && !msg.content && msg.thoughtSteps && (
                <div className={styles.cotThinkingRow}>
                  <img
                    src="/assets/hello-kitty/chat-face.jpg"
                    alt="Ollie Avatar"
                    className={styles.smallAvatar}
                  />
                  <div className={styles.cotThinkingContainer}>
                    <ChainOfThought>
                      {msg.thoughtSteps
                        .filter((_, sIdx) => sIdx <= activeStepIndex)
                        .map((step, sIdx) => (
                          <ChainOfThoughtStep
                            key={sIdx}
                            defaultOpen={sIdx === activeStepIndex}
                            isActive={sIdx === activeStepIndex}
                          >
                            <ChainOfThoughtTrigger>{step.title}</ChainOfThoughtTrigger>
                            <ChainOfThoughtContent>
                              {step.items.map((item, iIdx) => (
                                <ChainOfThoughtItem key={iIdx}>{item}</ChainOfThoughtItem>
                              ))}
                            </ChainOfThoughtContent>
                          </ChainOfThoughtStep>
                        ))}
                    </ChainOfThought>
                  </div>
                </div>
              )}

              {/* Normal message rendering (greeting, user, answered assistant messages) */}
              {!(msg.role === 'assistant' && msg.isThinking && !msg.content) && (
                <div
                  className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant
                    }`}
                >
                  {msg.role === 'assistant' && (
                    <img
                      src="/assets/hello-kitty/chat-face.jpg"
                      alt="Ollie Avatar"
                      className={styles.smallAvatar}
                    />
                  )}
                  <div
                    className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant
                      }`}
                  >
                    {msg.content && (
                      <div className={styles.answerText}>
                        {renderFormattedText(msg.content)}
                        {isLoading &&
                          msg.role === 'assistant' &&
                          msg === messages[messages.length - 1] && (
                            <span className={styles.cursorDot} />
                          )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Quick Prompt Suggestions when only greeting is shown */}
          {messages.length === 1 && !isLoading && (
            <div className={styles.suggestionsContainer}>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={styles.chip}
                  onClick={() => handleSend(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prompt-Kit Input Footer with requested ArrowUp circular send button */}
        <div className={styles.footer}>
          <PromptInput
            value={inputMessage}
            onValueChange={setInputMessage}
            isLoading={isLoading}
            onSubmit={() => handleSend()}
            className={styles.promptInputRoot}
          >
            <PromptInputTextarea placeholder="Ask Ollie anything about Akash..." />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction
                tooltip={isLoading ? 'Stop generation' : 'Send message'}
              >
                <Button
                  variant="default"
                  size="icon"
                  className={styles.arrowSendButton}
                  onClick={isLoading ? handleStop : () => handleSend()}
                  disabled={!isLoading && !inputMessage.trim()}
                  aria-label={isLoading ? 'Stop generation' : 'Send message'}
                >
                  {isLoading ? (
                    <Square className={styles.buttonIconSquare} />
                  ) : (
                    <ArrowUp className={styles.buttonIconArrow} />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};
