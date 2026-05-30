import { Controller, Post, Get, Param, Body, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiReflectionService, isReflectionPersona } from './ai-reflection.service';

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

  // Per-persona reflection. Higher limit than the default so a visitor can open
  // several persona tabs in one session; each (exhibit, persona) is cached after.
  @Throttle({ default: { ttl: 5 * 60_000, limit: 15 } })
  @Post('generate/:exhibitId/:persona')
  generatePersonaReflection(
    @Param('exhibitId') exhibitId: string,
    @Param('persona') persona: string,
  ) {
    if (!isReflectionPersona(persona)) {
      throw new BadRequestException('Unknown curator persona');
    }
    return this.aiReflectionService.generatePersonaReflection(exhibitId, persona);
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
