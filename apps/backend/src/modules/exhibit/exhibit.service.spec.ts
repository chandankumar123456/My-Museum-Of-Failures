import { ExhibitService } from './exhibit.service';

/**
 * Verifies the filter-to-Prisma-where shape rather than DB results.
 * Pure logic test: we record the args passed to prisma.exhibit.findMany.
 */
function makePrismaStub() {
  const calls: Array<Record<string, unknown>> = [];
  return {
    calls,
    exhibit: {
      findMany: jest.fn(async (args: Record<string, unknown>) => {
        calls.push(args);
        return [];
      }),
      count: jest.fn(async () => 0),
    },
    museumRoom: { findUnique: jest.fn() },
  };
}

const fakeGateway = { broadcastExhibitCreated: jest.fn() };

describe('ExhibitService.findAll', () => {
  let prisma: ReturnType<typeof makePrismaStub>;
  let service: ExhibitService;

  beforeEach(() => {
    prisma = makePrismaStub();
    service = new ExhibitService(prisma as any, fakeGateway as any);
  });

  it('applies category filter', async () => {
    await service.findAll({ category: 'burnout' as any });
    expect(prisma.calls[0].where).toMatchObject({ category: 'burnout' });
  });

  it('builds painLevel ranges from minPain + maxPain', async () => {
    await service.findAll({ minPain: 4, maxPain: 8 });
    expect(prisma.calls[0].where).toMatchObject({
      painLevel: { gte: 4, lte: 8 },
    });
  });

  it('builds OR clause for free-text search', async () => {
    await service.findAll({ search: 'regret' });
    const where = prisma.calls[0].where as { OR: Array<Record<string, unknown>> };
    expect(where.OR).toHaveLength(2);
    expect(where.OR[0]).toMatchObject({ title: { contains: 'regret' } });
    expect(where.OR[1]).toMatchObject({ story: { contains: 'regret' } });
  });

  it('honors sortBy + sortOrder', async () => {
    await service.findAll({ sortBy: 'painLevel', sortOrder: 'asc' });
    expect(prisma.calls[0].orderBy).toEqual({ painLevel: 'asc' });
  });

  it('defaults to createdAt desc', async () => {
    await service.findAll({});
    expect(prisma.calls[0].orderBy).toEqual({ createdAt: 'desc' });
  });

  it('applies emotionalTags as hasSome', async () => {
    await service.findAll({ emotionalTags: ['fear', 'shame'] });
    expect(prisma.calls[0].where).toMatchObject({
      emotionalTags: { hasSome: ['fear', 'shame'] },
    });
  });
});
