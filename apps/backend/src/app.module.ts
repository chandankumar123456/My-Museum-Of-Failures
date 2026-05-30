import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { ExhibitModule } from './modules/exhibit/exhibit.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmotionModule } from './modules/emotion/emotion.module';
import { RoomModule } from './modules/room/room.module';
import { ArtifactModule } from './modules/artifact/artifact.module';
import { AiReflectionModule } from './modules/ai-reflection/ai-reflection.module';
import { GenomeModule } from './modules/genome/genome.module';
import { ConstellationModule } from './modules/constellation/constellation.module';
import { AudioModule } from './modules/audio/audio.module';
import { TimeCapsuleModule } from './modules/time-capsule/time-capsule.module';
import { SocketModule } from './modules/socket/socket.module';
import { DecayModule } from './modules/decay/decay.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      // Default throttle: 60 requests per minute per IP.
      { name: 'default', ttl: 60_000, limit: 60 },
      // Burst protection: 10 requests per second per IP.
      { name: 'short', ttl: 1_000, limit: 10 },
      // Long-window cap: 600 requests per 5 minutes per IP.
      { name: 'long', ttl: 5 * 60_000, limit: 600 },
    ]),
    PrismaModule,
    HealthModule,
    ExhibitModule,
    AuthModule,
    EmotionModule,
    RoomModule,
    ArtifactModule,
    AiReflectionModule,
    GenomeModule,
    ConstellationModule,
    AudioModule,
    TimeCapsuleModule,
    SocketModule,
    DecayModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
