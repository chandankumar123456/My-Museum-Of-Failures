import { Controller, Post, Get, Body, Param, Res, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { SessionGuard, type AuthedRequest } from './session.guard';

type IdentityMode = 'anonymous' | 'pseudonym' | 'real_name';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessions: SessionService,
  ) {}

  @Post('anonymous')
  anonymousSession() {
    return this.authService.createAnonymousSession();
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  async register(
    @Body() body: { email: string; password: string; displayName?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(body.email, body.password, body.displayName);
    this.sessions.attach(res, result.user.id);
    return result;
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body.email, body.password);
    this.sessions.attach(res, result.user.id);
    return result;
  }

  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('pseudonym')
  async createPseudonym(
    @Body() body: { pseudonym: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.createPseudonymAccount(body.pseudonym);
    this.sessions.attach(res, result.user.id);
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.sessions.clear(res);
    return { ok: true };
  }

  /**
   * Returns the current session's user, if any. Used by the frontend on
   * boot to decide whether the visitor is logged in via cookie.
   */
  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() req: AuthedRequest) {
    return this.authService.getUserById(req.session!.userId);
  }

  @Get('user/:userId')
  getUser(@Param('userId') userId: string) {
    return this.authService.getUserById(userId);
  }

  @Post('identity-mode/:userId')
  updateIdentityMode(
    @Param('userId') userId: string,
    @Body() body: { mode: IdentityMode },
  ) {
    return this.authService.updateIdentityMode(userId, body.mode);
  }
}
