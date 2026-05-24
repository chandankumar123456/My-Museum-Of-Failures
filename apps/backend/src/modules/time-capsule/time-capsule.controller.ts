import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { TimeCapsuleService } from './time-capsule.service';

@Controller('time-capsule')
export class TimeCapsuleController {
  constructor(private readonly timeCapsuleService: TimeCapsuleService) {}

  @Post()
  create(@Body() body: { userId: string; title: string; message: string; unlockDate: string }) {
    return this.timeCapsuleService.create(
      body.userId,
      body.title,
      body.message,
      new Date(body.unlockDate),
    );
  }

  @Get('user/:userId')
  getUserCapsules(@Param('userId') userId: string) {
    return this.timeCapsuleService.getUserCapsules(userId);
  }

  @Get(':id/:userId')
  getCapsule(@Param('id') id: string, @Param('userId') userId: string) {
    return this.timeCapsuleService.getCapsuleById(id, userId);
  }

  @Post('legacy/:userId/:exhibitId')
  setLegacy(
    @Param('userId') userId: string,
    @Param('exhibitId') exhibitId: string,
  ) {
    return this.timeCapsuleService.setLegacyExhibit(userId, exhibitId);
  }

  @Get('legacy/:userId')
  getLegacy(@Param('userId') userId: string) {
    return this.timeCapsuleService.getLegacyExhibit(userId);
  }
}
