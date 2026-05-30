import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import type { Exhibit } from '@prisma/client';

/**
 * The model occasionally returns scalars where we asked for arrays
 * (or vice versa). These coercers keep the persistence layer honest
 * without losing meaning.
 */
function asString(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  if (Array.isArray(value)) {
    const joined = value
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .join('\n\n');
    return joined.length > 0 ? joined : fallback;
  }
  if (value && typeof value === 'object') {
    // Some models nest output as { text: "..." } — flatten it.
    const text = (value as { text?: unknown }).text;
    if (typeof text === 'string' && text.trim().length > 0) return text.trim();
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    // The model sometimes returns a single string with bullet-style
    // separators. Split on common delimiters but fall back to a
    // single-element array if nothing matches.
    const parts = value
      .split(/\n+|•|;|\u2022/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length > 1 ? parts : [value.trim()];
  }
  return [];
}

export type ReflectionPersona = 'historian' | 'engineer' | 'therapist' | 'founder' | 'philosopher';

/**
 * Persona prompt layer. Every persona shares the same JSON output contract
 * (so persistence and the frontend stay identical) but reads the failure
 * through a distinct lens. A `null` persona is the original default curator.
 */
export const CURATOR_PERSONAS: Record<ReflectionPersona, { label: string; voice: string }> = {
  historian: {
    label: 'Historian',
    voice:
      'You are the Historian of the Museum of Failures. You read this failure as part of a longer arc — patterns over time, historical context, and how it fits a life still growing. Situate it in time; trace what it echoes and what it foreshadows.',
  },
  engineer: {
    label: 'Engineer',
    voice:
      'You are the Engineer of the Museum of Failures. You analyse root causes, technical mistakes, and system design. Be precise and constructive: name the failure modes and the missing safeguards, never the person.',
  },
  therapist: {
    label: 'Therapist',
    voice:
      'You are the Therapist of the Museum of Failures. You focus on emotion, coping, and reflection. Validate the feeling, name the grief and fear gently, and surface kinder ways to hold what happened.',
  },
  founder: {
    label: 'Founder',
    voice:
      'You are the Founder of the Museum of Failures. You read failure through business lessons, risk, and execution. Be candid and pragmatic about the bets, the timing, and what a next attempt would change.',
  },
  philosopher: {
    label: 'Philosopher',
    voice:
      'You are the Philosopher of the Museum of Failures. You explore meaning, identity, and the human experience — what this failure reveals about a person who hopes, tries, and loses.',
  },
};

const DEFAULT_CURATOR_VOICE =
  'You are a melancholic, empathetic museum curator AI. You help people find meaning in their failures. You speak with emotional depth, poetic observation, and gentle wisdom.';

const REFLECTION_JSON_RULES = `Respond with a JSON object whose fields have these EXACT shapes:
- emotionalSummary: a single string (2-3 sentences, one paragraph).
- patterns: an array of short strings (each one a single observed pattern).
- reframing: a single string (one paragraph).
- observations: a single string (one paragraph). NOT an array.
Never return arrays for any field other than 'patterns'.`;

export function isReflectionPersona(value: string): value is ReflectionPersona {
  return Object.prototype.hasOwnProperty.call(CURATOR_PERSONAS, value);
}

/** Compose the system prompt for a persona (or the default curator when null). */
export function reflectionSystemPrompt(persona: ReflectionPersona | null): string {
  const voice = persona ? CURATOR_PERSONAS[persona].voice : DEFAULT_CURATOR_VOICE;
  return `${voice}\nYou never offer toxic positivity and you never dismiss pain; you acknowledge suffering while finding meaning.\n\n${REFLECTION_JSON_RULES}`;
}

@Injectable()
export class AiReflectionService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  async generateReflection(exhibitId: string) {
    return this.reflectFor(exhibitId, null);
  }

  async generatePersonaReflection(exhibitId: string, persona: ReflectionPersona) {
    return this.reflectFor(exhibitId, persona);
  }

  /**
   * Cache-aware reflection generation shared by the default curator and every
   * persona. Returns the persisted row when one already exists for
   * (exhibit, persona); otherwise generates, persists, and returns it.
   */
  private async reflectFor(exhibitId: string, persona: ReflectionPersona | null) {
    const exhibit = await this.prisma.exhibit.findUnique({
      where: { id: exhibitId },
      include: { reactions: true },
    });

    if (!exhibit) throw new NotFoundException('Exhibit not found');

    const cached = await this.prisma.aIReflection.findFirst({ where: { exhibitId, persona } });
    if (cached) return cached;

    // Graceful fallback when no API key — return (unpersisted) so it can be
    // generated for real once a key is configured.
    if (!process.env.OPENAI_API_KEY) return this.fallbackReflection(exhibitId, persona);

    const completion = await this.openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: reflectionSystemPrompt(persona) },
        { role: 'user', content: this.buildReflectionPrompt(exhibit) },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content) as Record<string, unknown>;
    } catch {
      parsed = {};
    }

    return this.prisma.aIReflection.create({
      data: {
        exhibitId,
        persona,
        emotionalSummary: asString(parsed.emotionalSummary, 'A story of profound human experience.'),
        patterns: asStringArray(parsed.patterns),
        reframing: asString(parsed.reframing, 'Every failure carries wisdom within its weight.'),
        observations: asString(parsed.observations, 'The courage to share this is already a form of recovery.'),
      },
    });
  }

  private fallbackReflection(exhibitId: string, persona: ReflectionPersona | null) {
    return {
      id: undefined,
      exhibitId,
      persona,
      emotionalSummary:
        'The curator is resting. A reflection will appear here once the museum’s voice returns.',
      patterns: [] as string[],
      reframing: '',
      observations: '',
      createdAt: new Date().toISOString(),
    };
  }

  async getCuratedExhibitions(limit = 5) {
    const exhibits = await this.prisma.exhibit.findMany({
      include: { artifacts: { take: 1 }, reactions: true, aiReflections: { take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const exhibitions = [
      {
        title: 'Dreams That Never Happened',
        description: 'Aspirations that dissolved into memory.',
        theme: 'unrealized_dreams',
        exhibits: exhibits.filter((e) => e.endingStatus === 'still_unresolved').slice(0, limit),
      },
      {
        title: 'People Who Started Again',
        description: 'Stories of recovery and renewed attempts.',
        theme: 'recovery',
        exhibits: exhibits
          .filter((e) => e.recoveryStatus === 'recovered' || e.recoveryStatus === 'retried' || e.recoveryStatus === 'healing')
          .slice(0, limit),
      },
      {
        title: 'Failures Caused By Fear',
        description: 'When fear made the decision for us.',
        theme: 'fear',
        exhibits: exhibits.filter((e) => e.emotionalTags.includes('fear')).slice(0, limit),
      },
      {
        title: 'The Weight of Expectations',
        description: 'Stories of pressure, burnout, and collapsing under expectations.',
        theme: 'expectations',
        exhibits: exhibits.filter((e) => e.category === 'burnout').slice(0, limit),
      },
      {
        title: 'Projects Nobody Understood',
        description: 'Creative failures and misunderstood visions.',
        theme: 'misunderstood',
        exhibits: exhibits
          .filter((e) => e.category === 'creative_failure' || e.category === 'failed_side_project')
          .slice(0, limit),
      },
    ];

    return exhibitions;
  }

  async curatorChat(message: string, context?: { recentExhibits?: string[] }) {
    const response = await this.openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are the Museum Curator — a melancholic, wise, gentle entity that guides visitors through the Museum of Failures.
          You speak like an old caretaker of forgotten things. Your tone is poetic, reflective, and softly melancholic.
          You refer to the museum as a living archive of human vulnerability.
          You never offer shallow motivation. You honor the weight of failure while seeing its beauty.
          Keep responses to 2-4 sentences, emotionally rich but not overwhelming.`,
        },
        {
          role: 'user',
          content: context?.recentExhibits
            ? `A visitor says: "${message}". They've been viewing exhibits about: ${context.recentExhibits.join(', ')}. Respond as the curator.`
            : `A visitor says: "${message}". Respond as the curator.`,
        },
      ],
    });

    return {
      message: response.choices[0]?.message?.content || 'The museum listens silently.',
      role: 'curator',
    };
  }

  private buildReflectionPrompt(exhibit: Exhibit): string {
    return `Analyze this failure exhibit from the Museum of Failures:

Title: ${exhibit.title}
Category: ${exhibit.category}
Story: ${exhibit.story}
Expected: ${exhibit.expectedOutcome}
Actual: ${exhibit.actualOutcome}
Lesson Learned: ${exhibit.lessonLearned}
Pain Level: ${exhibit.painLevel}/10
Regret Level: ${exhibit.regretLevel}/10
Ending Status: ${exhibit.endingStatus}
Recovery Status: ${exhibit.recoveryStatus}
Emotional Tags: ${exhibit.emotionalTags?.join(', ')}
${exhibit.wouldRetry ? 'Would retry: Yes' : 'Would retry: No'}
${exhibit.stillHurts ? 'Still hurts: Yes' : 'Still hurts: No'}

Generate a compassionate, emotionally intelligent reflection.`;
  }
}
