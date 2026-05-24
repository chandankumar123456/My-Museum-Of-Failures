import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ExhibitService, CreateExhibitDto } from './exhibit.service';
import { ExhibitionCategory, EndingStatusType, RecoveryStatusType } from '@prisma/client';

@Controller('exhibits')
export class ExhibitController {
  constructor(private readonly exhibitService: ExhibitService) {}

  @Post()
  create(@Body() dto: CreateExhibitDto) {
    return this.exhibitService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.exhibitService.findAll(query);
  }

  @Get('one-sentence')
  getOneSentence(@Query('limit') limit?: string) {
    return this.exhibitService.getOneSentenceConfessions(Number(limit) || 20);
  }

  @Get('unread')
  getUnread(@Query('limit') limit?: string) {
    return this.exhibitService.getUnreadConfessions(Number(limit) || 10);
  }

  @Get('emotional-search')
  emotionalSearch(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.exhibitService.emotionalSearch(query, Number(limit) || 10);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exhibitService.findById(id);
  }

  @Get(':id/similar')
  getSimilar(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.exhibitService.getSimilar(id, Number(limit) || 5);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateExhibitDto>) {
    return this.exhibitService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exhibitService.remove(id);
  }

  @Post(':id/retry')
  incrementRetry(@Param('id') id: string) {
    return this.exhibitService.incrementRetry(id);
  }
}
