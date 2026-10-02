'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Loader2, Square, Bot, User, Copy, Check, AlertTriangle, ChevronDown, ChevronUp, Trash2, Plus, Sparkles } from 'lucide-react';
import { cn, formatDate, generateId } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  toolCalls?: any[];
  toolCallId?: string;
  metadata?: any;
  createdAt?: string;
}

interface Step {
  step: number;
  thought: string;
  toolCalls: any[];
  toolResults: any[];
  completed: boolean;
}

export default function AgentPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentSteps([]);

    try {
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: input,
          conversationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to start agent');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      let assistantMessage: Message | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'step') {
              setCurrentSteps((prev) => {
                const existing = prev.findIndex((s) => s.step === data.step.step);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = data.step;
                  return updated;
                }
                return [...prev, data.step];
              });
            } else if (data.type === 'complete') {
              if (data.result?.finalAnswer) {
                assistantMessage = {
                  id: generateId(),
                  role: 'assistant',
                  content: data.result.finalAnswer,
                  metadata: data.result,
                  createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
              }
              if (data.result?.conversationId) {
                setConversationId(data.result.conversationId);
              }
            } else if (data.type === 'error') {
              assistantMessage = {
                id: generateId(),
                role: 'assistant',
                content: `Error: ${data.error}`,
                metadata: { error: true },
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: true },
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentSteps([]);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setCurrentSteps([]);
  };

  const renderMessageContent = (message: Message) => {
    if (message.role === 'tool') {
      try {
        const data = JSON.parse(message.content);
        return (
          <div className="rounded-lg bg-muted p-3 text-sm font-mono text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{data.name}</span>
              <span className={cn('px-1.5 py-0.5 rounded text-xs', data.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400')}>
                {data.success ? 'Success' : 'Error'}
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(data.result, null, 2)}</pre>
            {data.error && <p className="text-red-600 dark:text-red-400 mt-1">{data.error}</p>}
          </div>
        );
      } catch {
        return <pre className="whitespace-pre-wrap text-sm">{message.content}</pre>;
      }
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
        components={{
          code: ({ children, ...props }) => {
            const { className, ...rest } = props;
            const language = className?.replace('language-', '') || 'text';
            return (
              <div className="relative group">
                <pre className="rounded-lg bg-muted p-4 overflow-x-auto"><code className={cn('font-mono text-sm', language)} {...rest}>{children}</code></pre>
                <button
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                  onClick={() => navigator.clipboard.writeText(String(children))}
                  aria-label="Copy code"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Agent Workspace
          </h1>
          {conversationId && (
            <span className="text-sm text-muted-foreground font-mono">{conversationId.slice(0, 8)}...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
          <button
            onClick={() => setShowSteps(!showSteps)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              showSteps
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Steps
          </button>
        </div>
      </div>

      {/* Steps Panel */}
      {showSteps && currentSteps.length > 0 && (
        <div className="border-b border-border bg-muted/30 p-4 max-h-64 overflow-y-auto">
          <h3 className="text-sm font-medium mb-3">Execution Steps</h3>
          <div className="space-y-3">
            {currentSteps.map((step) => (
              <div key={step.step} className="rounded-lg bg-card p-3 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-muted-foreground">Step {step.step}</span>
                  {step.completed && <Check className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{step.thought || 'Processing...'}</p>
                {step.toolCalls.length > 0 && (
                  <div className="space-y-1">
                    {step.toolCalls.map((tc, i) => (
                      <div key={i} className="text-xs font-mono text-muted-foreground bg-muted p-1.5 rounded">
                        {tc.name}({JSON.stringify(tc.arguments).slice(0, 100)}...)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot className="h-16 w-16 mb-4 opacity-50" />
            <h2 className="text-xl font-medium mb-2">Start a conversation</h2>
            <p className="text-center max-w-md">Ask me to research, calculate, write code, analyze files, or help with any task. I'll use tools to get it done.</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                'Research the latest AI developments',
                'Calculate compound interest for $10k at 7% for 10 years',
                'Create a React component for a todo list',
                'Search for TypeScript best practices',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 max-w-4xl mx-auto w-full',
              message.role === 'user' && 'flex-row-reverse'
            )}
          >
            <div
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : message.role === 'tool'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary/10 text-primary'
              )}
            >
              {message.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : message.role === 'tool' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                'flex-1 min-w-0',
                message.role === 'user' ? 'text-right' : ''
              )}
            >
              <div
                className={cn(
                  'inline-block max-w-[85%] rounded-2xl px-4 py-2',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : message.role === 'tool'
                    ? 'bg-muted text-foreground rounded-bl-none'
                    : 'bg-muted text-foreground rounded-tl-none'
                )}
              >
                {renderMessageContent(message)}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {message.createdAt && (
                  <span>{formatDate(message.createdAt)}</span>
                )}
                {message.metadata?.usage && (
                  <span className="font-mono">
                    {message.metadata.usage.totalTokens} tokens
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-4xl mx-auto w-full">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="inline-block max-w-[85%] rounded-2xl bg-muted px-4 py-2 rounded-tl-none">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything... (Shift+Enter for new line)"
              rows={1}
              maxRows={8}
              className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'flex-shrink-0 rounded-lg px-4 py-3 transition-colors',
                isLoading || !input.trim()
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}