import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('anonymous')
  anonymousSession() {
    return this.authService.createAnonymousSession();
  }

  @Post('register')
  register(@Body() body: { email: string; password: string; displayName?: string }) {
    return this.authService.register(body.email, body.password, body.displayName);
  }

  @Post('pseudonym')
  createPseudonym(@Body() body: { pseudonym: string }) {
    return this.authService.createPseudonymAccount(body.pseudonym);
  }

  @Get('user/:userId')
  getUser(@Param('userId') userId: string) {
    return this.authService.getUserById(userId);
  }

  @Post('identity-mode/:userId')
  updateIdentityMode(
    @Param('userId') userId: string,
    @Body() body: { mode: 'anonymous' | 'pseudonym' | 'real_name' },
  ) {
    return this.authService.updateIdentityMode(userId, body.mode);
  }
}
