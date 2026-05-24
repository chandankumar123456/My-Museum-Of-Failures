import { Controller, Post, Get, Param } from '@nestjs/common';
import { EmotionService } from './emotion.service';
import { EmotionalReactionType } from '@prisma/client';

@Controller('emotions')
export class EmotionController {
  constructor(private readonly emotionService: EmotionService) {}

  @Post(':exhibitId/react/:reaction')
  addReaction(
    @Param('exhibitId') exhibitId: string,
    @Param('reaction') reaction: EmotionalReactionType,
  ) {
    return this.emotionService.addReaction(exhibitId, reaction);
  }

  @Get(':exhibitId/reactions')
  getReactions(@Param('exhibitId') exhibitId: string) {
    return this.emotionService.getReactions(exhibitId);
  }

  @Get(':exhibitId/not-alone')
  getYouAreNotAlone(@Param('exhibitId') exhibitId: string) {
    return this.emotionService.getYouAreNotAlone(exhibitId);
  }
}
