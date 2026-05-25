import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiReflectionService } from './ai-reflection.service';

/**
 * AI endpoints carry the strictest throttling because each call costs
 * money and time. Per-IP limits are intentionally low.
 *  - /generate/:exhibitId : 5 / 5 minutes  (one per user per session, ish)
 *  - /curator             : 20 / minute     (chat is bursty)
 */
@Controller('ai-reflection')
export class AiReflectionController {
  constructor(private readonly aiReflectionService: AiReflectionService) {}

  @Throttle({ default: { ttl: 5 * 60_000, limit: 5 } })
  @Post('generate/:exhibitId')
  generateReflection(@Param('exhibitId') exhibitId: string) {
    return this.aiReflectionService.generateReflection(exhibitId);
  }

  @Get('curated-exhibitions')
  getCuratedExhibitions() {
    return this.aiReflectionService.getCuratedExhibitions();
  }

  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post('curator')
  curatorChat(@Body() body: { message: string; context?: { recentExhibits?: string[] } }) {
    return this.aiReflectionService.curatorChat(body.message, body.context);
  }
}
