import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ExhibitModule } from './modules/exhibit/exhibit.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmotionModule } from './modules/emotion/emotion.module';
import { RoomModule } from './modules/room/room.module';
import { ArtifactModule } from './modules/artifact/artifact.module';
import { AiReflectionModule } from './modules/ai-reflection/ai-reflection.module';
import { TimeCapsuleModule } from './modules/time-capsule/time-capsule.module';
import { SocketModule } from './modules/socket/socket.module';

@Module({
  imports: [
    PrismaModule,
    ExhibitModule,
    AuthModule,
    EmotionModule,
    RoomModule,
    ArtifactModule,
    AiReflectionModule,
    TimeCapsuleModule,
    SocketModule,
  ],
})
export class AppModule {}
