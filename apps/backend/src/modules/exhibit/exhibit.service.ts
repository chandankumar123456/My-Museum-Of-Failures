import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import {
  ExhibitionCategory,
  EndingStatusType,
  RecoveryStatusType,
  VisibilityMode,
  MuseumRoomSlug,
  EvolutionStatus,
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
  parentFailureId?: string;
  evolutionStatus?: EvolutionStatus;
  userId?: string;
}

/**
 * Filters as they arrive from `@Query()` — every value may still be a
 * raw string at this point (Express + Nest don't auto-coerce unless we
 * use class-validator + ValidationPipe transform). The service is
 * responsible for normalising before talking to Prisma.
 */
export interface ExhibitFilters {
  category?: ExhibitionCategory;
  roomId?: string;
  userId?: string;
  endingStatus?: EndingStatusType;
  recoveryStatus?: RecoveryStatusType;
  minPain?: number | string;
  maxPain?: number | string;
  emotionalTags?: string[] | string;
  search?: string;
  limit?: number | string;
  offset?: number | string;
  sortBy?: 'createdAt' | 'painLevel' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

/** Coerces a value to a finite integer or returns undefined. */
function toIntOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

function toStringArray(value: string[] | string | undefined): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
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
        ...(dto.parentFailureId ? { parentFailureId: dto.parentFailureId } : {}),
        evolutionStatus: dto.evolutionStatus ?? null,
        recoveredAt:
          dto.evolutionStatus === 'recovered' || dto.evolutionStatus === 'successful'
            ? new Date()
            : null,
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
    const minPain = toIntOrUndefined(filters?.minPain);
    const maxPain = toIntOrUndefined(filters?.maxPain);
    const limit = toIntOrUndefined(filters?.limit) ?? 20;
    const offset = toIntOrUndefined(filters?.offset) ?? 0;
    const tags = toStringArray(filters?.emotionalTags);

    const where: Prisma.ExhibitWhereInput = {};

    if (filters?.category) where.category = filters.category;
    if (filters?.roomId) where.roomId = filters.roomId;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.endingStatus) where.endingStatus = filters.endingStatus;
    if (filters?.recoveryStatus) where.recoveryStatus = filters.recoveryStatus;
    if (minPain !== undefined || maxPain !== undefined) {
      where.painLevel = {
        ...(minPain !== undefined ? { gte: minPain } : {}),
        ...(maxPain !== undefined ? { lte: maxPain } : {}),
      };
    }
    if (tags?.length) where.emotionalTags = { hasSome: tags };
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
        take: Math.max(1, Math.min(100, limit)),
        skip: Math.max(0, offset),
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

  /**
   * Build the full evolution lineage for an exhibit: walk up to the root,
   * then breadth-first down collecting every descendant, returning a nested
   * tree plus recovery metrics. A failure's lineage is small, so the
   * O(depth) query walk is intentional and avoids a recursive SQL CTE.
   */
  async getEvolutionTree(id: string) {
    const start = await this.prisma.exhibit.findUnique({
      where: { id },
      select: { id: true, parentFailureId: true },
    });
    if (!start) throw new NotFoundException('Exhibit not found');

    // Walk up to the root (cycle-guarded).
    let rootId = start.id;
    let parentId = start.parentFailureId;
    const seen = new Set<string>([start.id]);
    while (parentId && !seen.has(parentId)) {
      seen.add(parentId);
      rootId = parentId;
      const p = await this.prisma.exhibit.findUnique({
        where: { id: parentId },
        select: { id: true, parentFailureId: true },
      });
      if (!p) break;
      parentId = p.parentFailureId;
    }

    const select = {
      id: true,
      exhibitId: true,
      title: true,
      category: true,
      painLevel: true,
      evolutionStatus: true,
      recoveryStatus: true,
      lessonLearned: true,
      parentFailureId: true,
      createdAt: true,
      recoveredAt: true,
    } as const;

    const root = await this.prisma.exhibit.findUnique({ where: { id: rootId }, select });
    if (!root) throw new NotFoundException('Exhibit not found');

    // Breadth-first down from the root (cycle- and size-guarded).
    const all = [root];
    const guard = new Set<string>([root.id]);
    let frontier = [root.id];
    while (frontier.length && all.length < 200) {
      const children = await this.prisma.exhibit.findMany({
        where: { parentFailureId: { in: frontier } },
        select,
        orderBy: { createdAt: 'asc' },
      });
      frontier = [];
      for (const c of children) {
        if (guard.has(c.id)) continue;
        guard.add(c.id);
        all.push(c);
        frontier.push(c.id);
      }
    }

    type Row = (typeof all)[number];
    const childrenByParent = new Map<string, Row[]>();
    for (const n of all) {
      if (!n.parentFailureId) continue;
      const arr = childrenByParent.get(n.parentFailureId) ?? [];
      arr.push(n);
      childrenByParent.set(n.parentFailureId, arr);
    }
    const build = (node: Row): Row & { children: unknown[] } => ({
      ...node,
      children: (childrenByParent.get(node.id) ?? []).map(build),
    });

    const recovered = all.filter(
      (n) => n.evolutionStatus === 'recovered' || n.evolutionStatus === 'successful',
    );
    const lastRecovered = recovered.reduce<Row | null>(
      (a, b) => (!a || b.createdAt > a.createdAt ? b : a),
      null,
    );
    const recoveredAt = lastRecovered?.recoveredAt ?? null;
    const timeToRecoverDays = recoveredAt
      ? Math.max(0, Math.round((recoveredAt.getTime() - root.createdAt.getTime()) / 86_400_000))
      : null;

    return {
      rootId,
      focusId: id,
      tree: build(root),
      metrics: {
        attempts: all.length,
        retries: Math.max(0, all.length - 1),
        recovered: recovered.length > 0,
        timeToRecoverDays,
        lessons: recovered.map((n) => n.lessonLearned).filter(Boolean),
      },
    };
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
        ...(data.parentFailureId !== undefined && {
          parentFailureId: data.parentFailureId || null,
        }),
        ...(data.evolutionStatus && { evolutionStatus: data.evolutionStatus }),
        ...((data.evolutionStatus === 'recovered' || data.evolutionStatus === 'successful') &&
          !exhibit.recoveredAt && { recoveredAt: new Date() }),
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
