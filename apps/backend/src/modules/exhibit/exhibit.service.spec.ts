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

  it('coerces string limit/offset coming from query strings to numbers', async () => {
    // Simulate what NestJS @Query() actually delivers: raw strings.
    await service.findAll({
      limit: '50' as unknown as number,
      offset: '10' as unknown as number,
    });
    expect(prisma.calls[0].take).toBe(50);
    expect(prisma.calls[0].skip).toBe(10);
  });

  it('caps limit at 100 and clamps to >= 1', async () => {
    await service.findAll({ limit: '500' as unknown as number });
    expect(prisma.calls[0].take).toBe(100);

    await service.findAll({ limit: '0' as unknown as number });
    expect(prisma.calls[1].take).toBe(1);
  });

  it('parses comma-separated emotionalTags from query strings', async () => {
    await service.findAll({
      emotionalTags: 'fear, shame ,regret' as unknown as string[],
    });
    expect(prisma.calls[0].where).toMatchObject({
      emotionalTags: { hasSome: ['fear', 'shame', 'regret'] },
    });
  });
});


describe('ExhibitService.findAll userId filter', () => {
  it('applies userId filter', async () => {
    const prisma = makePrismaStub();
    const service = new ExhibitService(prisma as any, fakeGateway as any);
    await service.findAll({ userId: 'user_1' });
    expect(prisma.calls[0].where).toMatchObject({ userId: 'user_1' });
  });
});

describe('ExhibitService.getEvolutionTree', () => {
  function makeTreeStub(rows: Array<Record<string, any>>) {
    const byId = new Map(rows.map((r) => [r.id, r]));
    return {
      exhibit: {
        findUnique: jest.fn(async ({ where }: any) => byId.get(where.id) ?? null),
        findMany: jest.fn(async ({ where }: any) => {
          const ids: string[] = where.parentFailureId.in;
          return rows.filter((r) => r.parentFailureId && ids.includes(r.parentFailureId));
        }),
      },
      museumRoom: { findUnique: jest.fn() },
    };
  }

  const lineage = [
    { id: 'A', exhibitId: 'EX-A', title: 'Attempt 1', category: 'startup_failure', painLevel: 8, evolutionStatus: 'failed', recoveryStatus: 'gave_up', lessonLearned: 'L1', parentFailureId: null, createdAt: new Date('2024-01-01T00:00:00Z'), recoveredAt: null },
    { id: 'B', exhibitId: 'EX-B', title: 'Attempt 2', category: 'startup_failure', painLevel: 6, evolutionStatus: 'ongoing', recoveryStatus: 'retried', lessonLearned: 'L2', parentFailureId: 'A', createdAt: new Date('2024-02-01T00:00:00Z'), recoveredAt: null },
    { id: 'C', exhibitId: 'EX-C', title: 'Pivot', category: 'startup_failure', painLevel: 3, evolutionStatus: 'recovered', recoveryStatus: 'recovered', lessonLearned: 'L3', parentFailureId: 'B', createdAt: new Date('2024-03-01T00:00:00Z'), recoveredAt: new Date('2024-03-11T00:00:00Z') },
  ];

  it('builds the nested tree from a leaf, walking up to the root', async () => {
    const prisma = makeTreeStub(lineage);
    const service = new ExhibitService(prisma as any, fakeGateway as any);
    const result = await service.getEvolutionTree('C');

    expect(result.rootId).toBe('A');
    expect(result.focusId).toBe('C');
    expect(result.tree.id).toBe('A');
    expect((result.tree.children[0] as any).id).toBe('B');
    expect((result.tree.children[0] as any).children[0].id).toBe('C');
  });

  it('computes recovery metrics', async () => {
    const prisma = makeTreeStub(lineage);
    const service = new ExhibitService(prisma as any, fakeGateway as any);
    const { metrics } = await service.getEvolutionTree('C');

    expect(metrics.attempts).toBe(3);
    expect(metrics.retries).toBe(2);
    expect(metrics.recovered).toBe(true);
    expect(metrics.timeToRecoverDays).toBe(70);
    expect(metrics.lessons).toContain('L3');
  });

  it('throws when the exhibit is missing', async () => {
    const prisma = makeTreeStub([]);
    const service = new ExhibitService(prisma as any, fakeGateway as any);
    await expect(service.getEvolutionTree('nope')).rejects.toThrow();
  });
});
