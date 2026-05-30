import { Module } from '@nestjs/common';
import { ConstellationService } from './constellation.service';
import { ConstellationController } from './constellation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ConstellationController],
  providers: [ConstellationService],
  exports: [ConstellationService],
})
export class ConstellationModule {}
