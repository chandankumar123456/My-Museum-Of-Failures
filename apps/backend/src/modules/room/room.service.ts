import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MuseumRoomSlug } from '@prisma/client';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.museumRoom.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: { select: { exhibits: true } },
      },
    });
  }

  async findBySlug(slug: MuseumRoomSlug) {
    return this.prisma.museumRoom.findUnique({
      where: { slug },
      include: {
        exhibits: {
          include: { artifacts: { take: 1 }, reactions: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { exhibits: true } },
      },
    });
  }

  async getRandomWalk(limit = 10) {
    const count = await this.prisma.exhibit.count();
    const skip = count > limit ? Math.floor(Math.random() * (count - limit)) : 0;

    return this.prisma.exhibit.findMany({
      skip,
      take: limit,
      include: { artifacts: { take: 1 }, reactions: true, room: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLastAttempts(limit = 20) {
    return this.prisma.exhibit.findMany({
      where: { wouldRetry: true, retryCount: { gte: 1 } },
      include: { artifacts: { take: 1 }, reactions: true },
      take: limit,
      orderBy: { retryCount: 'desc' },
    });
  }
}
