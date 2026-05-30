import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

interface EdgeCandidate {
  sourceId: string;
  targetId: string;
  type: string;
  strength: number;
}

@Injectable()
export class ConstellationService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
  }

  async rebuild() {
    const exhibits = await this.prisma.exhibit.findMany({
      take: 250,
      orderBy: { createdAt: 'desc' },
      include: { reactions: true },
    });

    if (exhibits.length === 0) return { nodes: 0, edges: 0 };

    const hasApiKey = !!process.env.OPENAI_API_KEY;

    // Compute embeddings for exhibits missing them
    if (hasApiKey) {
      const needsEmbedding = exhibits.filter((e) => e.embedding.length === 0);
      for (let i = 0; i < needsEmbedding.length; i += 20) {
        const batch = needsEmbedding.slice(i, i + 20);
        const inputs = batch.map(
          (e) => `${e.title}\n${e.story}\n${e.lessonLearned}\n${e.emotionalTags.join(', ')}`,
        );
        const res = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: inputs,
        });
        await Promise.all(
          batch.map((e, idx) =>
            this.prisma.exhibit.update({
              where: { id: e.id },
              data: { embedding: res.data[idx].embedding },
            }),
          ),
        );
        // Update local reference
        for (let j = 0; j < batch.length; j++) {
          batch[j].embedding = res.data[j].embedding;
        }
      }
    }

    // Update impactScore
    await Promise.all(
      exhibits.map((e) =>
        this.prisma.exhibit.update({
          where: { id: e.id },
          data: {
            impactScore: Math.min(100, e.painLevel * 8 + (e.viewCount || 0) + e.reactions.length * 4),
          },
        }),
      ),
    );

    // Rebuild edges
    await this.prisma.failureConnection.deleteMany();

    const allEdges: EdgeCandidate[] = [];

    for (let i = 0; i < exhibits.length; i++) {
      const a = exhibits[i];
      const nodeEdges: EdgeCandidate[] = [];

      for (let j = 0; j < exhibits.length; j++) {
        if (i === j) continue;
        const b = exhibits[j];
        const [src, tgt] = a.id < b.id ? [a.id, b.id] : [b.id, a.id];

        // similar_category
        if (a.category === b.category) {
          nodeEdges.push({ sourceId: src, targetId: tgt, type: 'similar_category', strength: 0.5 });
        }

        // same_user_journey
        if (
          (a.userId && a.userId === b.userId) ||
          a.parentFailureId === b.id ||
          b.parentFailureId === a.id
        ) {
          nodeEdges.push({ sourceId: src, targetId: tgt, type: 'same_user_journey', strength: 0.7 });
        }

        // similar_emotion (tag overlap ratio)
        if (a.emotionalTags.length > 0 && b.emotionalTags.length > 0) {
          const setA = new Set(a.emotionalTags);
          const overlap = b.emotionalTags.filter((t) => setA.has(t)).length;
          const ratio = overlap / Math.max(a.emotionalTags.length, b.emotionalTags.length);
          if (ratio > 0) {
            nodeEdges.push({ sourceId: src, targetId: tgt, type: 'similar_emotion', strength: ratio });
          }
        }

        // Embedding-based edges
        if (hasApiKey && a.embedding.length > 0 && b.embedding.length > 0) {
          const sim = cosine(a.embedding, b.embedding);
          if (sim > 0.78) {
            nodeEdges.push({ sourceId: src, targetId: tgt, type: 'similar_lesson', strength: sim });
            nodeEdges.push({ sourceId: src, targetId: tgt, type: 'similar_cause', strength: sim });
          }
        }
      }

      // Keep top 5 by strength
      nodeEdges.sort((x, y) => y.strength - x.strength);
      allEdges.push(...nodeEdges.slice(0, 5));
    }

    // Deduplicate by composite key
    const seen = new Set<string>();
    const unique: EdgeCandidate[] = [];
    for (const e of allEdges) {
      const key = `${e.sourceId}|${e.targetId}|${e.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(e);
      }
    }

    if (unique.length > 0) {
      await this.prisma.failureConnection.createMany({
        data: unique.map((e) => ({
          sourceId: e.sourceId,
          targetId: e.targetId,
          type: e.type as 'similar_emotion' | 'similar_lesson' | 'similar_category' | 'similar_cause' | 'same_user_journey',
          strength: e.strength,
        })),
        skipDuplicates: true,
      });
    }

    return { nodes: exhibits.length, edges: unique.length };
  }

  /**
   * Optional scheduled rebuild. Off by default so it never incurs surprise
   * OpenAI embedding cost; set CONSTELLATION_AUTO_REBUILD=true to enable.
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async scheduledRebuild() {
    if (process.env.CONSTELLATION_AUTO_REBUILD === 'true') {
      await this.rebuild();
    }
  }

  async graph() {
    const exhibits = await this.prisma.exhibit.findMany({
      take: 250,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        exhibitId: true,
        title: true,
        category: true,
        painLevel: true,
        impactScore: true,
      },
    });

    const edges = await this.prisma.failureConnection.findMany();

    return {
      nodes: exhibits.map((e) => ({
        id: e.id,
        exhibitId: e.exhibitId,
        title: e.title,
        category: e.category,
        painLevel: e.painLevel,
        impactScore: e.impactScore ?? e.painLevel * 8,
      })),
      edges: edges.map((e) => ({
        source: e.sourceId,
        target: e.targetId,
        type: e.type,
        strength: e.strength,
      })),
    };
  }
}
