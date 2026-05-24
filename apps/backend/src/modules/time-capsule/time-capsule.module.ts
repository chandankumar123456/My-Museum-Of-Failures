import { Module } from '@nestjs/common';
import { TimeCapsuleService } from './time-capsule.service';
import { TimeCapsuleController } from './time-capsule.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimeCapsuleController],
  providers: [TimeCapsuleService],
  exports: [TimeCapsuleService],
})
export class TimeCapsuleModule {}
