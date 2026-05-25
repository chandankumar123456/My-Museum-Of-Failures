import { AiReflectionService } from './ai-reflection.service';

/**
 * The AiReflectionService keeps two private helpers (`asString` and
 * `asStringArray`) inside the same module. We can't import them
 * directly without exporting, but their behaviour is observable via
 * the `prisma.aIReflection.create` call. We assert the persisted
 * shape after the OpenAI call returns deliberately-malformed JSON.
 */
function makePrismaStub() {
  const calls: Array<{ data: Record<string, unknown> }> = [];
  return {
    calls,
    aIReflection: {
      findFirst: jest.fn(async () => null),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        calls.push({ data });
        return { id: 'ref_1', ...data };
      }),
    },
    exhibit: {
      findUnique: jest.fn(async () => ({
        id: 'ex_1',
        title: 'A test exhibit',
        category: 'burnout',
        story: '...',
        expectedOutcome: '...',
        actualOutcome: '...',
        lessonLearned: '...',
        emotionalState: '',
        painLevel: 5,
        regretLevel: 5,
        recoveryProgress: 0,
        stillHurts: true,
        wouldRetry: false,
        endingStatus: 'still_unresolved',
        recoveryStatus: 'healing',
        emotionalTags: [],
      })),
    },
  };
}

function makeService(jsonContent: string) {
  const prisma = makePrismaStub();
  const service = new AiReflectionService(prisma as any);
  // Stub OpenAI client so no network calls fire.
  (service as any).openai = {
    chat: {
      completions: {
        create: jest.fn(async () => ({
          choices: [{ message: { content: jsonContent } }],
        })),
      },
    },
  };
  return { service, prisma };
}

describe('AiReflectionService.generateReflection coercion', () => {
  it('joins an observations array into a single paragraph string', async () => {
    const { service, prisma } = makeService(
      JSON.stringify({
        emotionalSummary: 'A quiet collapse.',
        patterns: ['perfectionism', 'avoidance'],
        reframing: 'Fear had a seat at the table.',
        observations: ['Builder mind', 'Frightened evaluator', 'Silence as grief'],
      }),
    );

    await service.generateReflection('ex_1');
    const data = prisma.calls[0].data;
    expect(typeof data.observations).toBe('string');
    expect(data.observations).toBe('Builder mind\n\nFrightened evaluator\n\nSilence as grief');
    expect(Array.isArray(data.patterns)).toBe(true);
    expect(data.patterns).toEqual(['perfectionism', 'avoidance']);
  });

  it('wraps a stray patterns string into an array', async () => {
    const { service, prisma } = makeService(
      JSON.stringify({
        emotionalSummary: 'Hope dimmed slowly.',
        patterns: 'one big pattern only',
        reframing: 'Care can look like fear.',
        observations: 'A single paragraph.',
      }),
    );

    await service.generateReflection('ex_1');
    const data = prisma.calls[0].data;
    expect(data.patterns).toEqual(['one big pattern only']);
  });

  it('falls back to safe defaults when fields are missing', async () => {
    const { service, prisma } = makeService('{}');
    await service.generateReflection('ex_1');
    const data = prisma.calls[0].data;
    expect(data.emotionalSummary).toMatch(/profound human experience/);
    expect(data.patterns).toEqual([]);
    expect(data.reframing).toMatch(/wisdom within its weight/);
    expect(data.observations).toMatch(/courage to share/);
  });

  it('survives malformed JSON entirely', async () => {
    const { service, prisma } = makeService('not even json');
    await service.generateReflection('ex_1');
    const data = prisma.calls[0].data;
    expect(typeof data.emotionalSummary).toBe('string');
    expect(Array.isArray(data.patterns)).toBe(true);
  });
});
