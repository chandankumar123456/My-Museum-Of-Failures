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
    const skip = Math.max(0, Math.floor(Math.random() * count) - limit);

    return this.prisma.exhibit.findMany({
      skip: skip > 0 ? skip : 0,
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

  async seedRooms() {
    const rooms = [
      { slug: MuseumRoomSlug.hall_of_broken_dreams, name: 'Hall of Broken Dreams', description: 'Dreams that never came true. Aspirations crushed by reality.', ambience: 'echoing_hall', lighting: 'dim_amber', orderIndex: 1 },
      { slug: MuseumRoomSlug.startup_cemetery, name: 'Startup Cemetery', description: 'Failed startups, abandoned products, and ideas that never took off.', ambience: 'cold_warehouse', lighting: 'fluorescent_flicker', orderIndex: 2 },
      { slug: MuseumRoomSlug.burnout_basement, name: 'Burnout Basement', description: 'Exhaustion, collapse, and the weight of too much pressure.', ambience: 'underground_hum', lighting: 'almost_dark', orderIndex: 3 },
      { slug: MuseumRoomSlug.academic_ruins, name: 'Academic Ruins', description: 'Exam failures, abandoned degrees, and educational regrets.', ambience: 'library_echo', lighting: 'reading_lamp', orderIndex: 4 },
      { slug: MuseumRoomSlug.gallery_of_lost_potential, name: 'Gallery of Lost Potential', description: 'What could have been. Talents never realized.', ambience: 'quiet_gallery', lighting: 'spotlight', orderIndex: 5 },
      { slug: MuseumRoomSlug.the_regret_archive, name: 'The Regret Archive', description: 'Decisions that haunt. Paths not taken.', ambience: 'archive_room', lighting: 'vintage_bulb', orderIndex: 6 },
      { slug: MuseumRoomSlug.abandoned_futures_wing, name: 'Abandoned Futures Wing', description: 'Futures that never arrived. Plans that dissolved.', ambience: 'wind_tunnel', lighting: 'broken_lights', orderIndex: 7 },
      { slug: MuseumRoomSlug.relationship_graveyard, name: 'Relationship Graveyard', description: 'Love lost, friendships broken, connections that faded.', ambience: 'rain_room', lighting: 'moonlight', orderIndex: 8 },
    ];

    for (const room of rooms) {
      await this.prisma.museumRoom.upsert({
        where: { slug: room.slug },
        update: room,
        create: room,
      });
    }

    return { seeded: rooms.length };
  }
}
