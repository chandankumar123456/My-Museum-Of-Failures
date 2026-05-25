import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Response } from 'express';

export interface SessionPayload {
  userId: string;
  /** Issued-at, seconds since epoch. */
  iat: number;
  /** Expiry, seconds since epoch. */
  exp: number;
}

const COOKIE_NAME = 'museum_session';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Lightweight HMAC-SHA256 signed token (header-less JWT-style):
 *   base64url(payload).base64url(signature)
 *
 * We don't pull in `jsonwebtoken` because the surface we need is small
 * and node's crypto is already strict-mode safe.
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  private get secret(): string {
    const s = process.env.JWT_SECRET;
    if (!s || s === 'museum-dev-secret') {
      // Warn loudly in prod if the placeholder is still present.
      if (process.env.NODE_ENV === 'production') {
        this.logger.error('JWT_SECRET is missing or using the dev fallback');
      }
      return s || 'museum-dev-secret';
    }
    return s;
  }

  private b64url(buf: Buffer): string {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private fromB64url(s: string): Buffer {
    const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
    return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
  }

  sign(payload: { userId: string; ttlSeconds?: number }): string {
    const now = Math.floor(Date.now() / 1000);
    const body: SessionPayload = {
      userId: payload.userId,
      iat: now,
      exp: now + (payload.ttlSeconds ?? DEFAULT_TTL_SECONDS),
    };
    const json = this.b64url(Buffer.from(JSON.stringify(body)));
    const sig = this.b64url(createHmac('sha256', this.secret).update(json).digest());
    return `${json}.${sig}`;
  }

  verify(token: string | undefined | null): SessionPayload | null {
    if (!token) return null;
    const [json, sig] = token.split('.');
    if (!json || !sig) return null;

    const expected = this.b64url(createHmac('sha256', this.secret).update(json).digest());
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    try {
      const parsed = JSON.parse(this.fromB64url(json).toString()) as SessionPayload;
      if (typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  attach(res: Response, userId: string, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const token = this.sign({ userId, ttlSeconds });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ttlSeconds * 1000,
      path: '/',
    });
    return token;
  }

  clear(res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
