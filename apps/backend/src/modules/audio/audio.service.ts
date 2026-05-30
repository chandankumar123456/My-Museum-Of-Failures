import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import { Readable } from 'stream';
import type { AudioStoryStatus } from '@prisma/client';

/** Map an audio mime type to a Whisper-supported filename extension. */
export function whisperExtension(mimeType: string): string {
  const sub = (mimeType.split('/')[1] || 'mp3').toLowerCase();
  if (sub === 'mpeg') return 'mp3';
  if (sub === 'x-m4a' || sub === 'mp4') return 'm4a';
  if (sub === 'x-wav') return 'wav';
  return sub;
}

@Injectable()
export class AudioService {
  private r2Client: S3Client;
  private openai: OpenAI;
  private bucket: string;

  constructor(private prisma: PrismaService) {
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
    this.bucket = process.env.R2_BUCKET_NAME || 'museum-artifacts';
  }

  async upload(exhibitId: string, file: Express.Multer.File) {
    const exhibit = await this.prisma.exhibit.findUnique({ where: { id: exhibitId } });
    if (!exhibit) throw new NotFoundException('Exhibit not found');

    const key = `audio/${exhibitId}/${randomUUID()}-${file.originalname}`;

    await this.r2Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const story = await this.prisma.audioStory.upsert({
      where: { exhibitId },
      create: {
        exhibitId,
        r2Key: key,
        mimeType: file.mimetype,
        size: file.size,
        status: 'uploaded' as AudioStoryStatus,
      },
      update: {
        r2Key: key,
        mimeType: file.mimetype,
        size: file.size,
        status: 'uploaded' as AudioStoryStatus,
        transcript: undefined,
        summary: null,
        lessons: [],
        emotionTimeline: undefined,
        duration: null,
      },
    });

    const url = await this.getSignedPlaybackUrl(key);
    return { ...story, url };
  }

  async get(exhibitId: string) {
    const story = await this.prisma.audioStory.findUnique({ where: { exhibitId } });
    if (!story) return null;

    const url = await this.getSignedPlaybackUrl(story.r2Key);
    return {
      ...story,
      url,
      transcript: story.transcript as { start: number; end: number; text: string }[] | null,
      emotionTimeline: story.emotionTimeline as { time: number; emotion: string; intensity: number }[] | null,
    };
  }

  async process(exhibitId: string) {
    const story = await this.prisma.audioStory.findUnique({ where: { exhibitId } });
    if (!story) throw new NotFoundException('Audio story not found');

    if (!process.env.OPENAI_API_KEY) return story;

    try {
      // Step 1: Transcribe
      await this.prisma.audioStory.update({
        where: { exhibitId },
        data: { status: 'transcribing' as AudioStoryStatus },
      });

      const obj = await this.r2Client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: story.r2Key }),
      );

      const stream = obj.Body as Readable;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
      }
      const audioBuffer = Buffer.concat(chunks);

      // Whisper infers the audio format from the filename extension.
      const audioFile = new File([audioBuffer], `audio.${whisperExtension(story.mimeType)}`, {
        type: story.mimeType,
      });

      const transcription = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: audioFile,
        response_format: 'verbose_json',
      });

      const segments = (transcription as unknown as { segments?: { start: number; end: number; text: string }[] }).segments?.map(
        (s) => ({ start: s.start, end: s.end, text: s.text.trim() }),
      ) ?? [];
      const duration = (transcription as unknown as { duration?: number }).duration ?? null;

      await this.prisma.audioStory.update({
        where: { exhibitId },
        data: { transcript: segments as unknown as undefined, duration, status: 'processing' as AudioStoryStatus },
      });

      // Step 2: AI analysis
      const fullText = segments.map((s) => s.text).join(' ');

      const completion = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are an empathetic analyst for the Museum of Failures. Analyze this audio transcript of someone sharing their failure story. Respond with JSON only.',
          },
          {
            role: 'user',
            content: `Analyze this failure story transcript and return a JSON object with:
- "summary": a 2-3 sentence empathetic summary
- "lessons": an array of 3-5 short lesson strings extracted from the story
- "emotionTimeline": an array of objects {time: number (seconds), emotion: string, intensity: number (0-100)} sampled at key emotional moments across the story (5-10 points)

Transcript (duration: ${duration}s):
${fullText}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content || '{}';
      let parsed: { summary?: string; lessons?: string[]; emotionTimeline?: { time: number; emotion: string; intensity: number }[] };
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = {};
      }

      await this.prisma.audioStory.update({
        where: { exhibitId },
        data: {
          summary: parsed.summary ?? null,
          lessons: parsed.lessons ?? [],
          emotionTimeline: (parsed.emotionTimeline ?? []) as unknown as undefined,
          status: 'ready' as AudioStoryStatus,
        },
      });

      return this.get(exhibitId);
    } catch {
      await this.prisma.audioStory.update({
        where: { exhibitId },
        data: { status: 'failed' as AudioStoryStatus },
      });
      return this.prisma.audioStory.findUnique({ where: { exhibitId } });
    }
  }

  async remove(exhibitId: string) {
    const story = await this.prisma.audioStory.findUnique({ where: { exhibitId } });
    if (!story) throw new NotFoundException('Audio story not found');

    await this.r2Client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: story.r2Key }),
    );

    return this.prisma.audioStory.delete({ where: { exhibitId } });
  }

  private async getSignedPlaybackUrl(key: string): Promise<string> {
    return getSignedUrl(
      this.r2Client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: 3600 },
    );
  }
}
