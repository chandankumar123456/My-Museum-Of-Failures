import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VisibilityMode } from '@prisma/client';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

type IdentityMode = 'anonymous' | 'pseudonym' | 'real_name';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Hashes a password with scrypt + per-user salt.
   * Stored format: `scrypt$<saltHex>$<derivedKeyHex>`.
   */
  private hashPassword(password: string): string {
    const salt = randomBytes(16);
    const derived = scryptSync(password, salt, 64);
    return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
  }

  private verifyPassword(password: string, stored: string | null): boolean {
    if (!stored) return false;
    const [scheme, saltHex, hashHex] = stored.split('$');
    if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
    try {
      const salt = Buffer.from(saltHex, 'hex');
      const expected = Buffer.from(hashHex, 'hex');
      const actual = scryptSync(password, salt, expected.length);
      return expected.length === actual.length && timingSafeEqual(expected, actual);
    } catch {
      return false;
    }
  }

  /**
   * Creates a fully anonymous, throwaway user record so the frontend
   * has a stable userId for time capsules, legacy vaults, and reactions.
   */
  async createAnonymousSession() {
    const user = await this.prisma.user.create({
      data: {
        identityMode: VisibilityMode.anonymous,
        isAnonymous: true,
      },
      select: { id: true, identityMode: true, isAnonymous: true, createdAt: true },
    });

    return {
      userId: user.id,
      identityMode: user.identityMode,
      isAnonymous: user.isAnonymous,
    };
  }

  async register(email: string, password: string, displayName?: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: this.hashPassword(password),
        displayName: displayName || null,
        identityMode: VisibilityMode.real_name,
        isAnonymous: false,
      },
    });

    return { user: this.sanitizeUser(user) };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { user: this.sanitizeUser(user) };
  }

  async createPseudonymAccount(pseudonym: string) {
    if (!pseudonym || pseudonym.trim().length < 2) {
      throw new BadRequestException('Pseudonym must be at least 2 characters');
    }

    const existing = await this.prisma.user.findFirst({ where: { pseudonym } });
    if (existing) {
      throw new BadRequestException('That pseudonym is already taken');
    }

    const user = await this.prisma.user.create({
      data: {
        pseudonym,
        displayName: pseudonym,
        identityMode: VisibilityMode.pseudonym,
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

    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async updateIdentityMode(userId: string, mode: IdentityMode) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { identityMode: mode as VisibilityMode },
      select: {
        id: true,
        identityMode: true,
        displayName: true,
        pseudonym: true,
        isAnonymous: true,
      },
    });
    return user;
  }

  /**
   * Strips sensitive fields (passwordHash) before returning a user.
   */
  private sanitizeUser<T extends { passwordHash?: string | null }>(user: T) {
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }
}
