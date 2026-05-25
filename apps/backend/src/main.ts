import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const r2Public = process.env.R2_PUBLIC_URL;
  const isProd = process.env.NODE_ENV === 'production';

  // Build a CSP that explicitly enumerates everywhere this app talks to.
  // Only enabled in production: in dev Next's HMR + RSC need looser rules.
  const cspDirectives: Record<string, string[] | undefined> = {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https://*.r2.dev',
      'https://*.r2.cloudflarestorage.com',
      ...(r2Public ? [r2Public] : []),
    ],
    connectSrc: [
      "'self'",
      frontendUrl,
      'https://api.openai.com',
      'wss:',
      'ws:',
      'https://*.r2.dev',
      'https://*.r2.cloudflarestorage.com',
      ...(r2Public ? [r2Public] : []),
    ],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: isProd ? [] : undefined,
  };

  // Drop undefined values so helmet doesn't complain.
  const directives = Object.fromEntries(
    Object.entries(cspDirectives).filter(([, v]) => v !== undefined),
  ) as Record<string, string[]>;

  app.use(
    helmet({
      contentSecurityPolicy: isProd ? { directives } : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.use(cookieParser(process.env.JWT_SECRET || 'museum-dev-secret'));

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Museum backend running on http://localhost:${port}`);
}

bootstrap();
