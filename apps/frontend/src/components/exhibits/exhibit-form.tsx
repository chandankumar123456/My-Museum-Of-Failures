'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, ENDING_STATUSES, RECOVERY_STATUSES } from '@/lib/constants';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

interface ExhibitFormProps {
  onSuccess?: (exhibit: unknown) => void;
}

export function ExhibitForm({ onSuccess }: ExhibitFormProps) {
  const { userId } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    category: '',
    story: '',
    expectedOutcome: '',
    actualOutcome: '',
    lessonLearned: '',
    emotionalState: '',
    painLevel: 5,
    regretLevel: 5,
    recoveryProgress: 0,
    stillHurts: true,
    wouldRetry: false,
    endingStatus: 'still_unresolved',
    recoveryStatus: 'healing',
    visibilityMode: 'anonymous',
    emotionalTags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Start', 'The Story', 'The Contrast', 'Emotions', 'Review'];

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.emotionalTags.includes(tagInput.trim())) {
      updateField('emotionalTags', [...form.emotionalTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateField('emotionalTags', form.emotionalTags.filter((t) => t !== tag));
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const exhibit = await api.exhibits.create({ ...form, userId });
      onSuccess?.(exhibit);
    } catch {
      setError('Failed to create exhibit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return form.title && form.category;
      case 1: return form.story;
      case 2: return form.expectedOutcome && form.actualOutcome;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-center gap-2 mb-12">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-colors ${
                i <= step
                  ? 'bg-ember/20 border-ember text-ember'
                  : 'border-museum-800 text-museum-600'
              }`}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-px transition-colors ${
                  i < step ? 'bg-ember/40' : 'bg-museum-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="font-serif text-3xl text-whisper-light">Name Your Failure</h2>
              <p className="text-whisper-dark font-light">
                What would you call this exhibit? What failure are you preserving?
              </p>

              <div>
                <input
                  type="text"
                  placeholder="Exhibit Title"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full bg-void border border-museum-800 rounded-sm px-4 py-3 text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-whisper-dark mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateField('category', cat.value)}
                      className={`text-left px-3 py-2 rounded-sm border text-sm transition-colors ${
                        form.category === cat.value
                          ? 'border-ember bg-ember/10 text-ember'
                          : 'border-museum-800 text-whisper-dark hover:border-museum-700'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-whisper-dark mb-2">Visibility</label>
                <div className="flex gap-3">
                  {[
                    { value: 'anonymous', label: 'Anonymous' },
                    { value: 'pseudonym', label: 'Pseudonym' },
                    { value: 'real_name', label: 'Real Name' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateField('visibilityMode', opt.value)}
                      className={`px-4 py-2 rounded-sm border text-sm transition-colors ${
                        form.visibilityMode === opt.value
                          ? 'border-ember bg-ember/10 text-ember'
                          : 'border-museum-800 text-whisper-dark hover:border-museum-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-serif text-3xl text-whisper-light">Tell Your Story</h2>
              <p className="text-whisper-dark font-light">
                Describe what happened. This is your space to be honest.
              </p>

              <div>
                <label className="block text-sm text-whisper-dark mb-2">Your Story</label>
                <textarea
                  placeholder="What happened? What led to this moment?"
                  value={form.story}
                  onChange={(e) => updateField('story', e.target.value)}
                  rows={8}
                  className="w-full bg-void border border-museum-800 rounded-sm px-4 py-3 text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-whisper-dark mb-2">Emotional State (optional)</label>
                <input
                  type="text"
                  placeholder="How did you feel during this time?"
                  value={form.emotionalState}
                  onChange={(e) => updateField('emotionalState', e.target.value)}
                  className="w-full bg-void border border-museum-800 rounded-sm px-4 py-3 text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-3xl text-whisper-light">Expectation vs Reality</h2>
              <p className="text-whisper-dark font-light">
                The most painful gap is between what we imagined and what happened.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-whisper mb-2">What I Thought Would Happen</label>
                  <textarea
                    placeholder="I believed that..."
                    value={form.expectedOutcome}
                    onChange={(e) => updateField('expectedOutcome', e.target.value)}
                    rows={5}
                    className="w-full bg-void border border-museum-800 rounded-sm px-4 py-3 text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ember mb-2">What Actually Happened</label>
                  <textarea
                    placeholder="But instead..."
                    value={form.actualOutcome}
                    onChange={(e) => updateField('actualOutcome', e.target.value)}
                    rows={5}
                    className="w-full bg-void border border-ember/30 rounded-sm px-4 py-3 text-whisper placeholder:text-museum-600 focus:border-ember focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-emerald-400 mb-2">What I Learned</label>
                <textarea
                  placeholder="What did this experience teach you?"
                  value={form.lessonLearned}
                  onChange={(e) => updateField('lessonLearned', e.target.value)}
                  rows={3}
                  className="w-full bg-void border border-emerald-900/30 rounded-sm px-4 py-3 text-whisper placeholder:text-museum-600 focus:border-emerald-700/50 focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-serif text-3xl text-whisper-light">Emotional Weight</h2>
              <p className="text-whisper-dark font-light">
                How much did this affect you? Be honest — this is for the archive.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-whisper-dark mb-2">
                    Pain Level: <span className="text-ember">{form.painLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={form.painLevel}
                    onChange={(e) => updateField('painLevel', Number(e.target.value))}
                    className="w-full accent-ember"
                  />
                  <div className="flex justify-between text-xs text-museum-700">
                    <span>Bearable</span>
                    <span>Unbearable</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-whisper-dark mb-2">
                    Regret Level: <span className="text-amber-400">{form.regretLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={form.regretLevel}
                    onChange={(e) => updateField('regretLevel', Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-whisper-dark mb-2">
                    Recovery Progress: <span className="text-blue-400">{form.recoveryProgress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.recoveryProgress}
                    onChange={(e) => updateField('recoveryProgress', Number(e.target.value))}
                    className="w-full accent-blue-400"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-whisper-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.stillHurts}
                    onChange={(e) => updateField('stillHurts', e.target.checked)}
                    className="accent-ember"
                  />
                  <span>Still hurts</span>
                </label>
                <label className="flex items-center gap-2 text-whisper-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.wouldRetry}
                    onChange={(e) => updateField('wouldRetry', e.target.checked)}
                    className="accent-ember"
                  />
                  <span>Would retry</span>
                </label>
              </div>

              <div>
                <label className="block text-sm text-whisper-dark mb-2">Ending Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {ENDING_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updateField('endingStatus', status.value)}
                      className={`text-left px-4 py-3 rounded-sm border text-sm transition-colors ${
                        form.endingStatus === status.value
                          ? 'border-ember bg-ember/10 text-ember'
                          : 'border-museum-800 text-whisper-dark hover:border-museum-700'
                      }`}
                    >
                      <div className="font-medium">{status.label}</div>
                      <div className="text-xs text-museum-600">{status.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-whisper-dark mb-2">Recovery Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {RECOVERY_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updateField('recoveryStatus', status.value)}
                      className={`text-left px-3 py-2 rounded-sm border text-sm transition-colors ${
                        form.recoveryStatus === status.value
                          ? 'border-ember bg-ember/10 text-ember'
                          : 'border-museum-800 text-whisper-dark hover:border-museum-700'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-whisper-dark mb-2">Emotional Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a tag (e.g. fear, regret, relief)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 bg-void border border-museum-800 rounded-sm px-3 py-2 text-sm text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 border border-museum-800 rounded-sm text-sm text-whisper-dark hover:border-ember/50 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.emotionalTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-void-light border border-museum-800 rounded-full text-xs text-whisper-dark flex items-center gap-1"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-museum-600 hover:text-ember">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-serif text-3xl text-whisper-light">Review Your Exhibit</h2>
              <p className="text-whisper-dark font-light">
                This will be preserved in the museum. Review before submitting.
              </p>

              <div className="museum-card p-6 space-y-4">
                <div>
                  <span className="text-xs text-museum-600 uppercase tracking-wider">Title</span>
                  <p className="font-serif text-xl text-whisper">{form.title}</p>
                </div>
                <div>
                  <span className="text-xs text-museum-600 uppercase tracking-wider">Category</span>
                  <p className="text-whisper-dark">{CATEGORIES.find((c) => c.value === form.category)?.label}</p>
                </div>
                <div>
                  <span className="text-xs text-museum-600 uppercase tracking-wider">Story Preview</span>
                  <p className="text-whisper-dark text-sm line-clamp-3">{form.story}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-ember">{form.painLevel}/10</div>
                    <div className="text-xs text-museum-600">Pain</div>
                  </div>
                  <div>
                    <div className="text-amber-400">{form.regretLevel}/10</div>
                    <div className="text-xs text-museum-600">Regret</div>
                  </div>
                  <div>
                    <div className="text-blue-400">{form.recoveryProgress}%</div>
                    <div className="text-xs text-museum-600">Recovery</div>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-museum-600 uppercase tracking-wider">Visibility</span>
                  <p className="text-whisper-dark capitalize">{form.visibilityMode.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-6 py-2 border border-museum-800 rounded-sm text-whisper-dark hover:border-museum-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            disabled={!canProceed()}
            className="px-6 py-2 bg-ember/20 border border-ember/50 rounded-sm text-ember hover:bg-ember/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            className="px-6 py-2 bg-ember/20 border border-ember/50 rounded-sm text-ember hover:bg-ember/30 transition-colors disabled:opacity-30"
          >
            {submitting ? 'Preserving...' : 'Preserve Exhibit'}
          </button>
        )}
      </div>
    </div>
  );
}
