import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

/**
 * Builds the CORS allow-list from FRONTEND_URL.
 *
 * - FRONTEND_URL may be a single origin or a comma-separated list.
 * - In dev we also accept the matching 127.0.0.1 variant for any
 *   localhost origin we were given. Browsers treat localhost and
 *   127.0.0.1 as different origins; both should work in development.
 */
function buildAllowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URL || 'http://localhost:3000';
  const origins = new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );

  if (process.env.NODE_ENV !== 'production') {
    for (const o of Array.from(origins)) {
      origins.add(o.replace('localhost', '127.0.0.1'));
      origins.add(o.replace('127.0.0.1', 'localhost'));
    }
  }

  return Array.from(origins);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const allowedOrigins = buildAllowedOrigins();
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
      ...allowedOrigins,
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
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow same-origin / non-browser callers (curl, server-to-server).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
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
  logger.log(`CORS allow-list: ${allowedOrigins.join(', ')}`);
}

bootstrap();
