import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConstellationService } from './constellation.service';
import { SessionGuard } from '../auth/session.guard';

@Controller('constellation')
export class ConstellationController {
  constructor(private readonly constellationService: ConstellationService) {}

  @Get('graph')
  graph() {
    return this.constellationService.graph();
  }

  @Post('rebuild')
  @UseGuards(SessionGuard)
  @Throttle({ default: { ttl: 5 * 60_000, limit: 3 } })
  rebuild() {
    return this.constellationService.rebuild();
  }
}
