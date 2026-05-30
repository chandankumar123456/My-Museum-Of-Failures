import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

/**
 * Failure Genome (Feature 3). Each exhibit gets a practical + emotional DNA
 * profile (0-100 trait scores) generated once by the LLM and cached in the
 * `failure_genomes` table (one row per exhibit). Trait keys are fixed so the
 * radar/bar visualisations and comparison maths stay stable.
 */

export const PRACTICAL_TRAITS = [
  'overconfidence',
  'planning',
  'execution',
  'communication',
  'consistency',
  'patience',
  'timing',
  'luck',
] as const;

export const EMOTIONAL_TRAITS = [
  'frustration',
  'regret',
  'embarrassment',
  'fear',
  'hope',
  'resilience',
] as const;

export type TraitMap = Record<string, number>;

/** Coerce arbitrary model output into a complete, clamped 0-100 trait map. */
export function clampTraitMap(raw: unknown, keys: readonly string[]): TraitMap {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out: TraitMap = {};
  for (const key of keys) {
    const n = Number(obj[key]);
    out[key] = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 50;
  }
  return out;
}

interface GenomePair {
  practical: TraitMap;
  emotional: TraitMap;
}

/** Per-trait closeness (100 − |Δ|) and overall average across all 14 traits. */
export function genomeSimilarity(a: GenomePair, b: GenomePair) {
  const closeness = (x: TraitMap, y: TraitMap, keys: readonly string[]) => {
    const map: TraitMap = {};
    for (const k of keys) map[k] = 100 - Math.abs((x[k] ?? 50) - (y[k] ?? 50));
    return map;
  };
  const practical = closeness(a.practical, b.practical, PRACTICAL_TRAITS);
  const emotional = closeness(a.emotional, b.emotional, EMOTIONAL_TRAITS);
  const values = [...Object.values(practical), ...Object.values(emotional)];
  const overall = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  return { practical, emotional, overall };
}

@Injectable()
export class GenomeService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
  }

  async generateGenome(exhibitId: string) {
    const cached = await this.prisma.failureGenome.findUnique({ where: { exhibitId } });
    if (cached) return cached;

    const exhibit = await this.prisma.exhibit.findUnique({
      where: { id: exhibitId },
      include: { aiReflections: { take: 3 } },
    });
    if (!exhibit) throw new NotFoundException('Exhibit not found');

    if (!process.env.OPENAI_API_KEY) {
      return {
        id: undefined,
        exhibitId,
        practical: clampTraitMap({}, PRACTICAL_TRAITS),
        emotional: clampTraitMap({}, EMOTIONAL_TRAITS),
        model: null,
        generatedAt: new Date().toISOString(),
      };
    }

    const reflections = exhibit.aiReflections
      .map((r) => `${r.emotionalSummary} ${r.reframing}`)
      .join('\n');

    const completion = await this.openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You profile a personal failure into a "genome" of trait scores.
Return a JSON object with exactly two keys:
- "practical": an object with these integer keys (0-100): ${PRACTICAL_TRAITS.join(', ')}.
- "emotional": an object with these integer keys (0-100): ${EMOTIONAL_TRAITS.join(', ')}.
Higher = more present in this failure. "overconfidence" high means hubris played a role; "luck" high means external chance mattered. Base scores on the evidence; do not default everything to 50.`,
        },
        {
          role: 'user',
          content: `Title: ${exhibit.title}
Category: ${exhibit.category}
Story: ${exhibit.story}
Expected: ${exhibit.expectedOutcome}
Actual: ${exhibit.actualOutcome}
Lesson: ${exhibit.lessonLearned}
Pain ${exhibit.painLevel}/10, Regret ${exhibit.regretLevel}/10
Emotional tags: ${exhibit.emotionalTags?.join(', ')}
Curator notes: ${reflections || 'none'}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(completion.choices[0]?.message?.content || '{}') as Record<string, unknown>;
    } catch {
      parsed = {};
    }

    return this.prisma.failureGenome.create({
      data: {
        exhibitId,
        practical: clampTraitMap(parsed.practical, PRACTICAL_TRAITS),
        emotional: clampTraitMap(parsed.emotional, EMOTIONAL_TRAITS),
        model: process.env.AI_MODEL || 'gpt-4o',
      },
    });
  }

  async compareGenomes(aId: string, bId: string) {
    const [a, b] = await Promise.all([this.generateGenome(aId), this.generateGenome(bId)]);
    const pairA = {
      practical: clampTraitMap(a.practical, PRACTICAL_TRAITS),
      emotional: clampTraitMap(a.emotional, EMOTIONAL_TRAITS),
    };
    const pairB = {
      practical: clampTraitMap(b.practical, PRACTICAL_TRAITS),
      emotional: clampTraitMap(b.emotional, EMOTIONAL_TRAITS),
    };
    return { a, b, similarity: genomeSimilarity(pairA, pairB) };
  }
}
