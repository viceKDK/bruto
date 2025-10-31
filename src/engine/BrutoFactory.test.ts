import { describe, expect, it, vi, afterEach } from 'vitest';
import { BrutoFactory } from './BrutoFactory';
import { AppearanceGenerator, AppearanceOption } from './AppearanceGenerator';
import { ProgressionService } from './progression/ProgressionService';

class StubAppearanceGenerator extends AppearanceGenerator {
  constructor(private readonly option: AppearanceOption) {
    super([
      {
        designId: option.designId,
        name: option.displayName,
        colorVariants: [option.colorVariant],
      },
    ]);
  }

  public randomAppearance(): AppearanceOption {
    return this.option;
  }
}

describe('BrutoFactory', () => {
  const appearance: AppearanceOption = {
    designId: 7,
    colorVariant: 2,
    displayName: 'Test Appearance',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a bruto with default stats and appearance', () => {
    const generator = new StubAppearanceGenerator(appearance);
    const progression = new ProgressionService();
    const scheduleSpy = vi.spyOn(progression, 'scheduleInitialLevelUp').mockImplementation(() => {});
    const factory = new BrutoFactory(generator, {}, progression);

    const bruto = factory.createNewBruto('user_1', 'Alpha');

    expect(bruto.name).toBe('Alpha');
    expect(bruto.userId).toBe('user_1');
    expect(bruto.level).toBe(1);
    expect(bruto.maxHp).toBe(60);
    expect(bruto.str).toBe(2);
    expect(bruto.appearanceId).toBe(appearance.designId);
    expect(bruto.colorVariant).toBe(appearance.colorVariant);
    expect(scheduleSpy).toHaveBeenCalledWith(bruto);
  });
});
