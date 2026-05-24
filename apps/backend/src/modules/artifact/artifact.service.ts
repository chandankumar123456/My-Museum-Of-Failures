import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArtifactType } from '@prisma/client';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class ArtifactService {
  private r2Client: S3Client;

  constructor(private prisma: PrismaService) {
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadArtifact(
    exhibitId: string,
    file: Express.Multer.File,
    type: ArtifactType,
  ) {
    const exhibit = await this.prisma.exhibit.findUnique({ where: { id: exhibitId } });
    if (!exhibit) throw new NotFoundException('Exhibit not found');

    const key = `artifacts/${exhibitId}/${Date.now()}-${file.originalname}`;

    await this.r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'museum-artifacts',
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const artifact = await this.prisma.artifact.create({
      data: {
        exhibitId,
        type,
        url: key,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return artifact;
  }

  async getArtifactUrl(artifactId: string) {
    const artifact = await this.prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!artifact) throw new NotFoundException('Artifact not found');

    const signedUrl = await getSignedUrl(
      this.r2Client,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'museum-artifacts',
        Key: artifact.url,
      }),
      { expiresIn: 3600 },
    );

    return { url: signedUrl, artifact };
  }

  async getExhibitArtifacts(exhibitId: string) {
    return this.prisma.artifact.findMany({
      where: { exhibitId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markDecayed(artifactId: string) {
    return this.prisma.artifact.update({
      where: { id: artifactId },
      data: { decayed: true },
    });
  }

  async decayOldArtifacts() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);

    return this.prisma.artifact.updateMany({
      where: { createdAt: { lte: thirtyDaysAgo }, decayed: false },
      data: { decayed: true },
    });
  }
}
