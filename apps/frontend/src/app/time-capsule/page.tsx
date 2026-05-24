'use client';

import { useState, useEffect } from 'react';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { TimeCapsuleCreate } from '@/components/time-capsule/capsule-create';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

export default function TimeCapsulePage() {
  const { userId } = useAuthStore();
  const [capsules, setCapsules] = useState<any>({ unlocked: [], locked: [] });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadCapsules = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await api.timeCapsule.getUser(userId);
      setCapsules(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCapsules(); }, [userId]);

  return (
    <MuseumLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="font-serif text-4xl text-whisper-light mb-2">⏳ Time Capsule</h1>
          <p className="text-whisper-dark font-light">
            Messages to your future self. Sealed until the right moment.
          </p>
        </motion.div>

        {!userId ? (
          <div className="museum-card p-8 text-center">
            <p className="text-museum-600 font-serif text-xl">Sign in to create time capsules.</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="mb-8 px-4 py-2 border border-museum-800 rounded-sm text-whisper-dark hover:border-ember/50 transition-colors"
            >
              {showCreate ? 'Close' : '+ New Capsule'}
            </button>

            {showCreate && (
              <div className="mb-8">
                <TimeCapsuleCreate userId={userId} onSuccess={() => { setShowCreate(false); loadCapsules(); }} />
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="museum-card p-5 animate-pulse">
                    <div className="h-5 bg-museum-800 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-museum-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {capsules.unlocked?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="font-serif text-xl text-whisper mb-4">Opened Capsules</h2>
                    <div className="space-y-3">
                      {capsules.unlocked.map((capsule: any) => (
                        <div key={capsule.id} className="museum-card p-4 border-emerald-900/30">
                          <h3 className="text-whisper font-medium">{capsule.title}</h3>
                          <p className="text-whisper-dark text-sm mt-1">{capsule.message}</p>
                          <p className="text-xs text-museum-600 mt-2">Opened {formatDate(capsule.openedAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {capsules.locked?.length > 0 && (
                  <div>
                    <h2 className="font-serif text-xl text-whisper mb-4">Sealed Capsules</h2>
                    <div className="space-y-3">
                      {capsules.locked.map((capsule: any) => (
                        <div key={capsule.id} className="museum-card p-4 border-museum-800 opacity-70">
                          <h3 className="text-whisper font-medium">{capsule.title}</h3>
                          <p className="text-xs text-museum-600 mt-1">
                            Unlocks {formatDate(capsule.unlockDate)}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-museum-700">
                            <span className="w-2 h-2 bg-amber-400/60 rounded-full" />
                            Sealed
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {capsules.unlocked?.length === 0 && capsules.locked?.length === 0 && (
                  <div className="text-center py-12 museum-card">
                    <p className="text-museum-600 font-serif text-lg">No capsules yet.</p>
                    <p className="text-museum-700 text-sm mt-1">Write to your future self.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </MuseumLayout>
  );
}
