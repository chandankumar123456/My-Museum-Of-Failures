import { Controller, Get, Post, Param } from '@nestjs/common';
import { RoomService } from './room.service';
import { MuseumRoomSlug } from '@prisma/client';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get('random-walk')
  randomWalk() {
    return this.roomService.getRandomWalk();
  }

  @Get('last-attempts')
  lastAttempts() {
    return this.roomService.getLastAttempts();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: MuseumRoomSlug) {
    return this.roomService.findBySlug(slug);
  }

  @Post('seed')
  seed() {
    return this.roomService.seedRooms();
  }
}
