import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Liveness + readiness probes for load balancers / uptime monitors. Exempt
 * from the global throttler so frequent polling is never rate-limited.
 */
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'up' };
    } catch {
      throw new HttpException(
        { status: 'not_ready', database: 'down' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
