import { Module } from '@nestjs/common';
import { ExhibitService } from './exhibit.service';
import { ExhibitController } from './exhibit.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExhibitController],
  providers: [ExhibitService],
  exports: [ExhibitService],
})
export class ExhibitModule {}
