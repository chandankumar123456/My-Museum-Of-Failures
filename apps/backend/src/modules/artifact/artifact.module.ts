import { Module } from '@nestjs/common';
import { ArtifactService } from './artifact.service';
import { ArtifactController } from './artifact.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArtifactController],
  providers: [ArtifactService],
  exports: [ArtifactService],
})
export class ArtifactModule {}
