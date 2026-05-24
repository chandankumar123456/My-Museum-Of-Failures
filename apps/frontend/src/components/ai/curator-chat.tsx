'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'curator';
  content: string;
}

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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-void-light border border-museum-700 flex items-center justify-center text-2xl hover:border-ember/50 transition-colors shadow-lg shadow-void"
      >
        🕯️
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] museum-card border-museum-700 flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-museum-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🕯️</span>
                <div>
                  <h3 className="font-serif text-whisper text-sm">Museum Curator</h3>
                  <p className="text-xs text-museum-600">The melancholic guide</p>
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
                    className={`max-w-[85%] p-3 rounded-sm text-sm ${
                      msg.role === 'user'
                        ? 'bg-ember/10 border border-ember/20 text-whisper'
                        : 'bg-void border border-museum-800 text-whisper-dark font-light'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-void border border-museum-800 p-3 rounded-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-ember/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-ember/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-ember/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="p-4 border-t border-museum-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Speak to the curator..."
                  className="flex-1 bg-void border border-museum-800 rounded-sm px-3 py-2 text-sm text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="px-3 py-2 border border-museum-800 rounded-sm text-sm text-whisper-dark hover:border-ember/50 disabled:opacity-30 transition-colors"
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
