import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * In-memory fake of the parts of PrismaService AuthService touches.
 * Avoids spinning up a real database for unit tests.
 */
function makePrismaStub() {
  const users: Array<Record<string, unknown>> = [];
  let nextId = 1;

  return {
    users,
    user: {
      create: jest.fn(async ({ data, select }: { data: Record<string, unknown>; select?: Record<string, boolean> }) => {
        const record = {
          id: `user_${nextId++}`,
          email: null,
          passwordHash: null,
          displayName: null,
          pseudonym: null,
          identityMode: 'anonymous',
          isAnonymous: false,
          legacyExhibitId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        users.push(record);
        if (select) {
          return Object.fromEntries(
            Object.entries(record).filter(([k]) => select[k]),
          );
        }
        return record;
      }),
      findUnique: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        if (where.id) return users.find((u) => u.id === where.id) ?? null;
        if (where.email) return users.find((u) => u.email === where.email) ?? null;
        return null;
      }),
      findFirst: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        if (where.pseudonym) {
          return users.find((u) => u.pseudonym === where.pseudonym) ?? null;
        }
        return null;
      }),
      update: jest.fn(async ({ where, data, select }: { where: Record<string, unknown>; data: Record<string, unknown>; select?: Record<string, boolean> }) => {
        const u = users.find((x) => x.id === where.id);
        if (!u) throw new Error('not found');
        Object.assign(u, data);
        if (select) {
          return Object.fromEntries(Object.entries(u).filter(([k]) => select[k]));
        }
        return u;
      }),
    },
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof makePrismaStub>;

  beforeEach(() => {
    prisma = makePrismaStub();
    service = new AuthService(prisma as any);
  });

  describe('createAnonymousSession', () => {
    it('creates an anonymous user with isAnonymous=true', async () => {
      const result = await service.createAnonymousSession();
      expect(result.userId).toMatch(/^user_/);
      expect(result.identityMode).toBe('anonymous');
      expect(result.isAnonymous).toBe(true);
    });
  });

  describe('register', () => {
    it('rejects empty email/password', async () => {
      await expect(service.register('', 'longenough')).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.register('a@b.com', '')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects passwords shorter than 8 characters', async () => {
      await expect(service.register('a@b.com', 'short')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects duplicate emails', async () => {
      await service.register('dup@example.com', 'password123');
      await expect(
        service.register('dup@example.com', 'password123'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('persists a scrypt-hashed password (not plaintext)', async () => {
      await service.register('ok@example.com', 'password123');
      const stored = prisma.users.find((u) => u.email === 'ok@example.com');
      expect(stored?.passwordHash).toBeDefined();
      expect(stored?.passwordHash).not.toBe('password123');
      expect(stored?.passwordHash).toMatch(/^scrypt\$[a-f0-9]+\$[a-f0-9]+$/);
    });

    it('strips passwordHash from the returned user', async () => {
      const result = await service.register('clean@example.com', 'password123');
      expect((result.user as Record<string, unknown>).passwordHash).toBeUndefined();
    });
  });

  describe('login', () => {
    it('verifies the password and returns the user', async () => {
      await service.register('login@example.com', 'password123');
      const result = await service.login('login@example.com', 'password123');
      expect(result.user.email).toBe('login@example.com');
    });

    it('rejects a wrong password', async () => {
      await service.register('login2@example.com', 'password123');
      await expect(
        service.login('login2@example.com', 'WRONG-password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects unknown email', async () => {
      await expect(
        service.login('nobody@example.com', 'password123'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('createPseudonymAccount', () => {
    it('rejects too-short pseudonyms', async () => {
      await expect(service.createPseudonymAccount('a')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects taken pseudonyms', async () => {
      await service.createPseudonymAccount('curator');
      await expect(service.createPseudonymAccount('curator')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('getUserById', () => {
    it('throws NotFoundException when missing', async () => {
      await expect(service.getUserById('nope')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
