'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface ReflectionPanelProps {
  exhibitId: string;
}

export function ReflectionPanel({ exhibitId }: ReflectionPanelProps) {
  const [reflection, setReflection] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.ai.generateReflection(exhibitId);
      setReflection(result);
    } catch {
      setError('The curator is silent. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(generate, 2000);
    return () => clearTimeout(timer);
  }, [exhibitId]);

  if (loading && !reflection) {
    return (
      <div className="museum-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-ember rounded-full animate-pulse" />
          <span className="text-sm text-whisper-dark">The curator is reflecting...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="museum-card p-6">
        <p className="text-sm text-museum-600">{error}</p>
        <button onClick={generate} className="mt-2 text-xs text-ember hover:text-ember-light transition-colors">
          Try again
        </button>
      </div>
    );
  }

  if (!reflection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="museum-card p-6 border-ember/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🕯️</span>
        <h3 className="font-serif text-lg text-whisper">Curator&apos;s Reflection</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-whisper font-light leading-relaxed italic">
            &ldquo;{reflection.emotionalSummary}&rdquo;
          </p>
        </div>

        {reflection.patterns?.length > 0 && (
          <div>
            <p className="text-xs text-museum-600 uppercase tracking-wider mb-2">Patterns Observed</p>
            <div className="flex flex-wrap gap-2">
              {reflection.patterns.map((pattern: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-void-light border border-museum-800 rounded-sm text-xs text-whisper-dark"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-museum-600 uppercase tracking-wider mb-1">Gentle Reframing</p>
          <p className="text-sm text-whisper-dark font-light">{reflection.reframing}</p>
        </div>

        <div>
          <p className="text-xs text-museum-600 uppercase tracking-wider mb-1">Observations</p>
          <p className="text-sm text-whisper-dark font-light">{reflection.observations}</p>
        </div>

        <div className="pt-2">
          <button
            onClick={generate}
            disabled={loading}
            className="text-xs text-museum-600 hover:text-ember transition-colors"
          >
            {loading ? 'Reflecting...' : 'Request new reflection'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
