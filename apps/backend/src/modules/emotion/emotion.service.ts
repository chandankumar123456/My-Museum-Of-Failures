import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmotionalReactionType } from '@prisma/client';

@Injectable()
export class EmotionService {
  constructor(private prisma: PrismaService) {}

  async addReaction(exhibitId: string, reaction: EmotionalReactionType, userId?: string) {
    const exhibit = await this.prisma.exhibit.findUnique({ where: { id: exhibitId } });
    if (!exhibit) throw new NotFoundException('Exhibit not found');

    const existing = await this.prisma.exhibitReaction.findUnique({
      where: {
        exhibitId_userId_reaction: {
          exhibitId,
          userId: userId ?? 'anonymous',
          reaction,
        },
      },
    });

    if (existing) {
      await this.prisma.exhibitReaction.delete({ where: { id: existing.id } });
      return { removed: true };
    }

    return this.prisma.exhibitReaction.create({
      data: {
        exhibitId,
        reaction,
        userId: userId ?? null,
      },
    });
  }

  async getReactions(exhibitId: string) {
    const reactions = await this.prisma.exhibitReaction.findMany({
      where: { exhibitId },
    });

    const counts: Record<string, number> = {};
    for (const r of reactions) {
      counts[r.reaction] = (counts[r.reaction] || 0) + 1;
    }

    return {
      total: reactions.length,
      counts,
      reactions,
    };
  }

  async getYouAreNotAlone(exhibitId: string, limit = 5) {
    const exhibit = await this.prisma.exhibit.findUnique({
      where: { id: exhibitId },
      select: { category: true, emotionalTags: true, endingStatus: true },
    });
    if (!exhibit) throw new NotFoundException('Exhibit not found');

    return this.prisma.exhibit.findMany({
      where: {
        id: { not: exhibitId },
        OR: [
          { category: exhibit.category },
          { emotionalTags: { hasSome: exhibit.emotionalTags } },
          { endingStatus: exhibit.endingStatus },
        ],
      },
      select: {
        id: true,
        exhibitId: true,
        title: true,
        category: true,
        endingStatus: true,
        painLevel: true,
        createdAt: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
