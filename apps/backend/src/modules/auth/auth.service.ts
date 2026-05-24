import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createAnonymousSession(): Promise<{ sessionId: string }> {
    const sessionId = crypto.randomUUID();
    return { sessionId };
  }

  async register(email: string, password: string, displayName?: string) {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: displayName || null,
        identityMode: 'real_name',
        isAnonymous: false,
      },
    });

    return { user: this.sanitizeUser(user) };
  }

  async createPseudonymAccount(pseudonym: string) {
    const user = await this.prisma.user.create({
      data: {
        pseudonym,
        identityMode: 'pseudonym',
        displayName: pseudonym,
        isAnonymous: false,
      },
    });

    return { user: this.sanitizeUser(user) };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { exhibits: true, timeCapsules: true } },
      },
    });

    if (!user) return null;
    return this.sanitizeUser(user);
  }

  async updateIdentityMode(userId: string, mode: 'anonymous' | 'pseudonym' | 'real_name') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { identityMode: mode },
      select: { id: true, identityMode: true, displayName: true, pseudonym: true },
    });
  }

  private sanitizeUser(user: any) {
    const { ...safe } = user;
    return safe;
  }
}
