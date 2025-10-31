import { describe, expect, it, vi, afterEach } from 'vitest';
import { AppearanceGenerator, AppearanceDefinition } from './AppearanceGenerator';

const mockDefinitions: AppearanceDefinition[] = [
  { designId: 1, name: 'Test One', colorVariants: [0, 1] },
  { designId: 2, name: 'Test Two', colorVariants: [0, 2] },
];

describe('AppearanceGenerator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a valid appearance option', () => {
    const generator = new AppearanceGenerator(mockDefinitions);
    vi.spyOn(Math, 'random').mockReturnValue(0.2);

    const appearance = generator.randomAppearance();

    expect(appearance.designId).toBe(1);
    expect([0, 1]).toContain(appearance.colorVariant);
    expect(appearance.displayName).toContain('Test One');
  });

  it('throws for empty definitions', () => {
    expect(() => new AppearanceGenerator([])).toThrow();
  });
});
