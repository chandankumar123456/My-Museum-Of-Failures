import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AudioController],
  providers: [AudioService],
  exports: [AudioService],
})
export class AudioModule {}
