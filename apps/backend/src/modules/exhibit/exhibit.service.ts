import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import {
  ExhibitionCategory,
  EndingStatusType,
  RecoveryStatusType,
  VisibilityMode,
  MuseumRoomSlug,
  Prisma,
} from '@prisma/client';

export interface CreateExhibitDto {
  title: string;
  category: ExhibitionCategory;
  story: string;
  expectedOutcome: string;
  actualOutcome: string;
  lessonLearned: string;
  emotionalState: string;
  painLevel: number;
  regretLevel: number;
  recoveryProgress: number;
  stillHurts: boolean;
  wouldRetry: boolean;
  endingStatus: EndingStatusType;
  recoveryStatus: RecoveryStatusType;
  visibilityMode: VisibilityMode;
  emotionalTags: string[];
  roomSlug?: string;
  isOneSentence?: boolean;
  isUnfinished?: boolean;
  userId?: string;
}

export interface ExhibitFilters {
  category?: ExhibitionCategory;
  roomId?: string;
  endingStatus?: EndingStatusType;
  recoveryStatus?: RecoveryStatusType;
  minPain?: number;
  maxPain?: number;
  emotionalTags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'painLevel' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ExhibitService {
  constructor(
    private prisma: PrismaService,
    private gateway: SocketGateway,
  ) {}

  async create(dto: CreateExhibitDto) {
    let roomId: string | undefined;

    if (dto.roomSlug) {
      const room = await this.prisma.museumRoom.findUnique({
        where: { slug: dto.roomSlug as MuseumRoomSlug },
      });
      if (room) roomId = room.id;
    }

    return this.prisma.exhibit.create({
      data: {
        title: dto.title,
        category: dto.category,
        story: dto.story,
        expectedOutcome: dto.expectedOutcome,
        actualOutcome: dto.actualOutcome,
        lessonLearned: dto.lessonLearned,
        emotionalState: dto.emotionalState,
        painLevel: dto.painLevel,
        regretLevel: dto.regretLevel,
        recoveryProgress: dto.recoveryProgress,
        stillHurts: dto.stillHurts,
        wouldRetry: dto.wouldRetry,
        endingStatus: dto.endingStatus,
        recoveryStatus: dto.recoveryStatus,
        visibilityMode: dto.visibilityMode,
        emotionalTags: dto.emotionalTags,
        isOneSentence: dto.isOneSentence ?? false,
        isUnfinished: dto.isUnfinished ?? false,
        roomId,
        userId: dto.userId ?? null,
      },
      include: {
        artifacts: true,
        reactions: true,
        room: true,
      },
    }).then((exhibit) => {
      this.gateway.broadcastExhibitCreated({
        exhibitId: exhibit.id,
        roomSlug: exhibit.room?.slug ?? null,
      });
      return exhibit;
    });
  }

  async findById(id: string) {
    const exhibit = await this.prisma.exhibit.findUnique({
      where: { id },
      include: {
        artifacts: true,
        reactions: true,
        room: true,
        aiReflections: true,
      },
    });

    if (!exhibit) throw new NotFoundException('Exhibit not found');

    await this.prisma.exhibit.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return exhibit;
  }

  async findByExhibitId(exhibitId: string) {
    const exhibit = await this.prisma.exhibit.findUnique({
      where: { exhibitId },
      include: {
        artifacts: true,
        reactions: true,
        room: true,
        aiReflections: true,
      },
    });

    if (!exhibit) throw new NotFoundException('Exhibit not found');
    return exhibit;
  }

  async findAll(filters?: ExhibitFilters) {
    const where: Prisma.ExhibitWhereInput = {};

    if (filters?.category) where.category = filters.category;
    if (filters?.roomId) where.roomId = filters.roomId;
    if (filters?.endingStatus) where.endingStatus = filters.endingStatus;
    if (filters?.recoveryStatus) where.recoveryStatus = filters.recoveryStatus;
    if (filters?.minPain || filters?.maxPain) {
      where.painLevel = {
        ...(filters.minPain !== undefined ? { gte: filters.minPain } : {}),
        ...(filters.maxPain !== undefined ? { lte: filters.maxPain } : {}),
      };
    }
    if (filters?.emotionalTags?.length) where.emotionalTags = { hasSome: filters.emotionalTags };
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { story: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const sortKey = filters?.sortBy || 'createdAt';
    const sortDir = filters?.sortOrder || 'desc';
    const orderBy: Prisma.ExhibitOrderByWithRelationInput = { [sortKey]: sortDir };

    const [exhibits, total] = await Promise.all([
      this.prisma.exhibit.findMany({
        where,
        include: {
          artifacts: { take: 1 },
          reactions: true,
          room: true,
        },
        orderBy,
        take: filters?.limit || 20,
        skip: filters?.offset || 0,
      }),
      this.prisma.exhibit.count({ where }),
    ]);

    return { exhibits, total };
  }

  async emotionalSearch(emotion: string, limit = 10) {
    const exhibits = await this.prisma.exhibit.findMany({
      where: {
        OR: [
          { emotionalTags: { has: emotion } },
          { emotionalState: { contains: emotion, mode: 'insensitive' } },
          { story: { contains: emotion, mode: 'insensitive' } },
        ],
      },
      include: {
        artifacts: { take: 1 },
        reactions: true,
        room: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return exhibits;
  }

  async getSimilar(exhibitId: string, limit = 5) {
    const exhibit = await this.prisma.exhibit.findUnique({ where: { id: exhibitId } });
    if (!exhibit) throw new NotFoundException('Exhibit not found');

    const similar = await this.prisma.exhibit.findMany({
      where: {
        id: { not: exhibitId },
        OR: [
          { category: exhibit.category },
          { emotionalTags: { hasSome: exhibit.emotionalTags } },
          { endingStatus: exhibit.endingStatus },
        ],
      },
      include: {
        artifacts: { take: 1 },
        reactions: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return similar;
  }

  async update(id: string, data: Partial<CreateExhibitDto>) {
    const exhibit = await this.prisma.exhibit.findUnique({ where: { id } });
    if (!exhibit) throw new NotFoundException('Exhibit not found');

    return this.prisma.exhibit.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.story && { story: data.story }),
        ...(data.lessonLearned && { lessonLearned: data.lessonLearned }),
        ...(data.painLevel !== undefined && { painLevel: data.painLevel }),
        ...(data.regretLevel !== undefined && { regretLevel: data.regretLevel }),
        ...(data.recoveryProgress !== undefined && { recoveryProgress: data.recoveryProgress }),
        ...(data.stillHurts !== undefined && { stillHurts: data.stillHurts }),
        ...(data.wouldRetry !== undefined && { wouldRetry: data.wouldRetry }),
        ...(data.endingStatus && { endingStatus: data.endingStatus }),
        ...(data.recoveryStatus && { recoveryStatus: data.recoveryStatus }),
        ...(data.emotionalTags && { emotionalTags: data.emotionalTags }),
      },
      include: {
        artifacts: true,
        reactions: true,
        room: true,
      },
    });
  }

  async remove(id: string) {
    const exhibit = await this.prisma.exhibit.findUnique({ where: { id } });
    if (!exhibit) throw new NotFoundException('Exhibit not found');

    return this.prisma.exhibit.delete({ where: { id } });
  }

  async getOneSentenceConfessions(limit = 20) {
    return this.prisma.exhibit.findMany({
      where: { isOneSentence: true },
      include: { reactions: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadConfessions(limit = 10) {
    return this.prisma.exhibit.findMany({
      where: { viewCount: 0 },
      include: { reactions: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementRetry(id: string) {
    return this.prisma.exhibit.update({
      where: { id },
      data: { retryCount: { increment: 1 } },
    });
  }

  async updateDecayLevels() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldExhibits = await this.prisma.exhibit.findMany({
      where: { createdAt: { lte: thirtyDaysAgo }, decayLevel: { lt: 5 } },
    });

    for (const exhibit of oldExhibits) {
      const daysOld = Math.floor((Date.now() - exhibit.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const decayLevel = Math.min(Math.floor(daysOld / 30), 5);

      await this.prisma.exhibit.update({
        where: { id: exhibit.id },
        data: { decayLevel, lastDecayUpdate: new Date() },
      });
    }
  }
}
