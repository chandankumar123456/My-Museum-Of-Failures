'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'curator';
  content: string;
}

const CandleIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-ember"
  >
    <motion.path
      d="M12 2C10 5 10 7.5 12 9C14 7.5 14 5 12 2Z"
      fill="currentColor"
      animate={{
        opacity: [0.92, 1, 0.94, 0.98, 0.92, 0.96, 0.92, 1, 0.95, 0.92],
        scale: [1, 1.04, 0.98, 1.02, 0.97, 1.01, 0.99, 1.03, 0.98, 1],
      }}
      transition={{
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
    <line x1="12" y1="9" x2="12" y2="13" />
    <path
      d="M9 13H15V21C15 21.5 14.5 22 14 22H10C9.5 22 9 21.5 9 21V13Z"
      fill="var(--color-paper)"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export function CuratorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'curator',
      content: 'Welcome, visitor. I am the curator of this museum. I tend to the exhibits, memories, and the silence between them. What brings you here tonight?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.ai.curatorChat(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'curator', content: response.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'curator',
          content: 'The museum echoes with silence. Perhaps we should listen.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-paper border border-glass-edge flex items-center justify-center hover:border-brass/50 transition-colors shadow-lg shadow-ink/10 cursor-pointer"
        aria-label="Speak to the curator"
      >
        <CandleIcon size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] bg-paper border border-glass-edge flex flex-col shadow-2xl shadow-ink/10 rounded-lg overflow-hidden"
          >
            <div className="p-4 border-b border-glass-edge">
              <div className="flex items-center gap-3">
                <CandleIcon size={20} />
                <div>
                  <h3 className="font-display text-ink text-sm">Museum Curator</h3>
                  <p className="text-xs text-ink-muted">The melancholic guide</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-md text-sm ${
                      msg.role === 'user'
                        ? 'bg-brass-soft border border-brass/30 text-ink'
                        : 'bg-vellum border border-glass-edge text-ink-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-vellum border border-glass-edge p-3 rounded-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-brass/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-brass/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-brass/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="p-4 border-t border-glass-edge">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Speak to the curator..."
                  className="flex-1 bg-bone border border-glass-edge rounded-md px-3 py-2 text-sm text-ink placeholder:text-whisper focus:border-brass/50 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-3 py-2 border border-glass-edge rounded-md text-sm text-ink-muted hover:border-brass/50 hover:text-brass disabled:opacity-30 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
