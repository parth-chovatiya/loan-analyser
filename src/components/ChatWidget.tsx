'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Trash2, Send, Bot } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import type { LoanInput, PrePayment, RateChange } from '../types/loan';

interface Props {
  loan: LoanInput;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
}

const SUGGESTIONS = [
  'When will my loan close?',
  'How much interest am I saving?',
  'What if I prepay 5 lakhs?',
  'Summarize my loan',
];

export const ChatWidget = ({ loan, prePayments, rateChanges }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearMessages } = useChat({
    loan,
    prePayments,
    rateChanges,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 ${
          isOpen
            ? 'h-12 w-12 bg-slate-700 text-white shadow-slate-700/25 hover:shadow-slate-700/35 sm:h-14 sm:w-14'
            : 'h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:shadow-blue-600/40'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
        ) : (
          <MessageCircle className="h-6 w-6" strokeWidth={2} />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white shadow-2xl transition-all duration-300
            max-sm:inset-0
            sm:bottom-24 sm:right-5 sm:rounded-2xl sm:border sm:border-slate-200`}
          style={{
            width: undefined,
            height: undefined,
          }}
        >
          {/* Mobile: full-screen sizing via inset-0 + Tailwind classes */}
          {/* Desktop: constrained size */}
          <style>{`
            @media (min-width: 640px) {
              .chat-panel-sized {
                width: min(400px, calc(100vw - 40px));
                height: min(540px, calc(100vh - 140px));
              }
            }
          `}</style>
          <div className="flex flex-col h-full sm:h-auto chat-panel-sized sm:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 sm:bg-none sm:bg-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 sm:bg-gradient-to-br sm:from-blue-600 sm:to-indigo-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white sm:text-slate-900">Loan Assistant</h3>
                  <p className="text-[10px] text-blue-100 sm:text-slate-400 leading-tight">AI-powered</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="cursor-pointer rounded-lg p-1.5 text-white/70 sm:text-slate-400 transition-colors hover:bg-white/10 sm:hover:bg-slate-100 hover:text-white sm:hover:text-slate-600"
                    title="Clear chat"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-white/70 sm:text-slate-400 transition-colors hover:bg-white/10 sm:hover:bg-slate-100 hover:text-white sm:hover:text-slate-600"
                  title="Close"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                    <Bot className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Ask about your loan</p>
                    <p className="text-xs text-slate-400 mt-1">Your loan details are sent to OpenAI to generate responses</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 mr-2 mt-1">
                      <Bot className="h-3 w-3 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-md'
                    }`}
                  >
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content || (
                        <span className="inline-flex items-center gap-1 py-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 bg-white px-3 py-3 sm:rounded-b-2xl">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your loan..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="cursor-pointer flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              {/* AI Disclaimer */}
              <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                AI-generated responses may not always be accurate. Verify important details independently.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
