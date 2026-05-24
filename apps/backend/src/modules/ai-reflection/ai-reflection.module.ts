import { Module } from '@nestjs/common';
import { AiReflectionService } from './ai-reflection.service';
import { AiReflectionController } from './ai-reflection.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiReflectionController],
  providers: [AiReflectionService],
  exports: [AiReflectionService],
})
export class AiReflectionModule {}
