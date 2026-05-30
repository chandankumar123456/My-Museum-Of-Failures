import { ConstellationService, cosine } from './constellation.service';

describe('cosine', () => {
  it('is 1 for identical vectors', () => {
    expect(cosine([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it('is 0 for orthogonal vectors', () => {
    expect(cosine([1, 0], [0, 1])).toBe(0);
  });

  it('is 0 for mismatched length or empty input', () => {
    expect(cosine([1, 2], [1, 2, 3])).toBe(0);
    expect(cosine([], [])).toBe(0);
  });
});

describe('ConstellationService.graph', () => {
  it('maps nodes (with impactScore fallback) and edges', async () => {
    const prisma = {
      exhibit: {
        findMany: jest.fn(async () => [
          { id: 'a', exhibitId: 'EX-A', title: 'A', category: 'burnout', painLevel: 5, impactScore: 60 },
          { id: 'b', exhibitId: 'EX-B', title: 'B', category: 'burnout', painLevel: 7, impactScore: null },
        ]),
      },
      failureConnection: {
        findMany: jest.fn(async () => [
          { sourceId: 'a', targetId: 'b', type: 'similar_category', strength: 0.5 },
        ]),
      },
    };
    const service = new ConstellationService(prisma as any);
    const g = await service.graph();

    expect(g.nodes).toHaveLength(2);
    expect(g.nodes[0].impactScore).toBe(60);
    expect(g.nodes[1].impactScore).toBe(56); // 7 * 8 fallback when null
    expect(g.edges[0]).toMatchObject({
      source: 'a',
      target: 'b',
      type: 'similar_category',
      strength: 0.5,
    });
  });
});
