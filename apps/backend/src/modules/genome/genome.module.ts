import { Module } from '@nestjs/common';
import { GenomeService } from './genome.service';
import { GenomeController } from './genome.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GenomeController],
  providers: [GenomeService],
  exports: [GenomeService],
})
export class GenomeModule {}
