import { Module } from '@nestjs/common';
import { DecayScheduler } from './decay.scheduler';
import { ExhibitModule } from '../exhibit/exhibit.module';
import { ArtifactModule } from '../artifact/artifact.module';

@Module({
  imports: [ExhibitModule, ArtifactModule],
  providers: [DecayScheduler],
})
export class DecayModule {}
