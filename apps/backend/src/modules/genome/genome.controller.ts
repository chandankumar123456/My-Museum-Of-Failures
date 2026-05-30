import { Controller, Get, Post, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GenomeService } from './genome.service';

@Controller('genome')
export class GenomeController {
  constructor(private readonly genomeService: GenomeService) {}

  @Throttle({ default: { ttl: 5 * 60_000, limit: 10 } })
  @Post('generate/:exhibitId')
  generate(@Param('exhibitId') exhibitId: string) {
    return this.genomeService.generateGenome(exhibitId);
  }

  // May generate up to two genomes (cache-aware), so the limit is modest.
  @Throttle({ default: { ttl: 5 * 60_000, limit: 10 } })
  @Get('compare/:aId/:bId')
  compare(@Param('aId') aId: string, @Param('bId') bId: string) {
    return this.genomeService.compareGenomes(aId, bId);
  }
}
