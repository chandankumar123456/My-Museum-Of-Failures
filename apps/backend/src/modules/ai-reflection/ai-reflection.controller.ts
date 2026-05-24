import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { AiReflectionService } from './ai-reflection.service';

@Controller('ai-reflection')
export class AiReflectionController {
  constructor(private readonly aiReflectionService: AiReflectionService) {}

  @Post('generate/:exhibitId')
  generateReflection(@Param('exhibitId') exhibitId: string) {
    return this.aiReflectionService.generateReflection(exhibitId);
  }

  @Get('curated-exhibitions')
  getCuratedExhibitions() {
    return this.aiReflectionService.getCuratedExhibitions();
  }

  @Post('curator')
  curatorChat(@Body() body: { message: string; context?: { recentExhibits?: string[] } }) {
    return this.aiReflectionService.curatorChat(body.message, body.context);
  }
}
