import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import type { Exhibit } from '@prisma/client';

type ReflectionPayload = {
  emotionalSummary: string;
  patterns: string[];
  reframing: string;
  observations: string;
};

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

@Injectable()
export class AiReflectionService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  async generateReflection(exhibitId: string) {
    const exhibit = await this.prisma.exhibit.findUnique({
      where: { id: exhibitId },
      include: { reactions: true },
    });

    if (!exhibit) throw new NotFoundException('Exhibit not found');

    const existingReflection = await this.prisma.aIReflection.findFirst({
      where: { exhibitId },
    });

    if (existingReflection) return existingReflection;

    const prompt = this.buildReflectionPrompt(exhibit);

    const completion = await this.openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a melancholic, empathetic museum curator AI. You help people find meaning in their failures.
You speak with emotional depth, poetic observation, and gentle wisdom.
You never offer toxic positivity or dismiss pain. You acknowledge suffering while finding meaning.

Respond with a JSON object whose fields have these EXACT shapes:
- emotionalSummary: a single string (2-3 sentences, one paragraph).
- patterns: an array of short strings (each one a single observed pattern).
- reframing: a single string (one paragraph, gentle reframe).
- observations: a single string (one paragraph). NOT an array.

Never return arrays for any field other than 'patterns'.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let parsed: Partial<ReflectionPayload> | Record<string, unknown>;
    try {
      parsed = JSON.parse(content) as Record<string, unknown>;
    } catch {
      parsed = {};
    }

    return this.prisma.aIReflection.create({
      data: {
        exhibitId,
        emotionalSummary: asString(
          (parsed as Record<string, unknown>).emotionalSummary,
          'A story of profound human experience.',
        ),
        patterns: asStringArray((parsed as Record<string, unknown>).patterns),
        reframing: asString(
          (parsed as Record<string, unknown>).reframing,
          'Every failure carries wisdom within its weight.',
        ),
        observations: asString(
          (parsed as Record<string, unknown>).observations,
          'The courage to share this is already a form of recovery.',
        ),
      },
    });
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
