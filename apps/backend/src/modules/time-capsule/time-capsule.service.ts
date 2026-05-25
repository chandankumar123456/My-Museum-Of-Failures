import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { TimeCapsule } from '@prisma/client';

type LockedCapsule = Omit<TimeCapsule, 'message'> & { message: null; locked: true };
type CapsulesView = { unlocked: TimeCapsule[]; locked: LockedCapsule[] };

@Injectable()
export class TimeCapsuleService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, title: string, message: string, unlockDate: Date) {
    return this.prisma.timeCapsule.create({
      data: {
        userId,
        title,
        message,
        unlockDate,
        isLocked: unlockDate > new Date(),
      },
    });
  }

  async getUserCapsules(userId: string): Promise<CapsulesView> {
    const now = new Date();

    const capsules = await this.prisma.timeCapsule.findMany({
      where: { userId },
      orderBy: { unlockDate: 'asc' },
    });

    const unlocked: TimeCapsule[] = [];
    const locked: LockedCapsule[] = [];

    for (const capsule of capsules) {
      if (capsule.unlockDate <= now && capsule.isLocked) {
        await this.prisma.timeCapsule.update({
          where: { id: capsule.id },
          data: { isLocked: false, openedAt: now },
        });
        unlocked.push({ ...capsule, isLocked: false, openedAt: now });
      } else if (capsule.unlockDate <= now) {
        unlocked.push(capsule);
      } else {
        locked.push({
          ...capsule,
          message: null,
          locked: true,
        });
      }
    }

    return { unlocked, locked };
  }

  async getCapsuleById(id: string, userId: string) {
    const capsule = await this.prisma.timeCapsule.findUnique({
      where: { id },
    });

    if (!capsule) throw new NotFoundException('Time capsule not found');
    if (capsule.userId !== userId) throw new NotFoundException('Time capsule not found');

    if (capsule.isLocked && capsule.unlockDate > new Date()) {
      return {
        ...capsule,
        message: 'This capsule is still sealed. Time will reveal its contents.',
        locked: true,
      };
    }

    return { ...capsule, locked: false };
  }

  async setLegacyExhibit(userId: string, exhibitId: string) {
    const exhibit = await this.prisma.exhibit.findUnique({ where: { id: exhibitId } });
    if (!exhibit) throw new NotFoundException('Exhibit not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { legacyExhibitId: exhibitId },
    });
  }

  async getLegacyExhibit(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { legacyExhibitId: true },
    });

    if (!user?.legacyExhibitId) return null;

    return this.prisma.exhibit.findUnique({
      where: { id: user.legacyExhibitId },
      include: { artifacts: true, reactions: true, aiReflections: true },
    });
  }
}
