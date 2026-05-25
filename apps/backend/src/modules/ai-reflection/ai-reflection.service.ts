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
          Respond with a JSON object containing: emotionalSummary (2-3 sentences), patterns (array of observed patterns), 
          reframing (a gentle reframe of their experience), observations (insightful observations about their story).`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let parsed: Partial<ReflectionPayload>;
    try {
      parsed = JSON.parse(content) as Partial<ReflectionPayload>;
    } catch {
      parsed = {};
    }

    return this.prisma.aIReflection.create({
      data: {
        exhibitId,
        emotionalSummary: parsed.emotionalSummary || 'A story of profound human experience.',
        patterns: parsed.patterns || [],
        reframing: parsed.reframing || 'Every failure carries wisdom within its weight.',
        observations: parsed.observations || 'The courage to share this is already a form of recovery.',
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
