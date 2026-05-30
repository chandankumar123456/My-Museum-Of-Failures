import {
  clampTraitMap,
  genomeSimilarity,
  PRACTICAL_TRAITS,
  EMOTIONAL_TRAITS,
} from './genome.service';

describe('clampTraitMap', () => {
  it('fills every key, clamps to 0-100, and rounds', () => {
    const out = clampTraitMap({ planning: 150, execution: -10, timing: 42.6 }, PRACTICAL_TRAITS);
    expect(Object.keys(out).sort()).toEqual([...PRACTICAL_TRAITS].sort());
    expect(out.planning).toBe(100);
    expect(out.execution).toBe(0);
    expect(out.timing).toBe(43);
    expect(out.luck).toBe(50); // missing → neutral default
  });

  it('defaults to 50 for non-object input', () => {
    const out = clampTraitMap(null, EMOTIONAL_TRAITS);
    expect(out.fear).toBe(50);
  });
});

describe('genomeSimilarity', () => {
  const base = {
    practical: clampTraitMap({}, PRACTICAL_TRAITS),
    emotional: clampTraitMap({}, EMOTIONAL_TRAITS),
  };

  it('is 100% when identical', () => {
    const { overall } = genomeSimilarity(base, base);
    expect(overall).toBe(100);
  });

  it('reflects per-trait distance', () => {
    const other = {
      practical: clampTraitMap({ ...base.practical, planning: 100 }, PRACTICAL_TRAITS),
      emotional: base.emotional,
    };
    const { practical, overall } = genomeSimilarity(base, other);
    expect(practical.planning).toBe(50); // |100-50| → 100-50
    expect(overall).toBeLessThan(100);
  });
});
