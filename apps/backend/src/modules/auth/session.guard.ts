import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SESSION_COOKIE_NAME, SessionService, type SessionPayload } from './session.service';

export interface AuthedRequest extends Request {
  session?: SessionPayload;
  cookies: Record<string, string>;
}

/**
 * Guards a route by requiring a valid signed session cookie. Failed
 * verification produces a 401 — there is no implicit fall-through to
 * anonymous access on guarded routes.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    const payload = this.sessions.verify(token);
    if (!payload) {
      throw new UnauthorizedException('Session expired or invalid');
    }
    req.session = payload;
    return true;
  }
}
