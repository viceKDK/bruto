/**
 * AppearanceGenerator - Randomizes bruto appearance based on predefined data.
 * Uses JSON data describing base designs and color variants.
 */

import appearances from '../data/appearances.json';

export interface AppearanceDefinition {
  designId: number;
  name: string;
  colorVariants: number[];
}

export interface AppearanceOption {
  designId: number;
  colorVariant: number;
  displayName: string;
}

export class AppearanceGenerator {
  private readonly designs: AppearanceDefinition[];

  constructor(definitions: AppearanceDefinition[] = appearances as AppearanceDefinition[]) {
    if (!definitions || definitions.length === 0) {
      throw new Error('Appearance definitions are required');
    }
    this.designs = definitions;
  }

  public randomAppearance(): AppearanceOption {
    const design = this.randomItem(this.designs);
    const colorVariant = this.randomItem(design.colorVariants);

    return {
      designId: design.designId,
      colorVariant,
      displayName: `${design.name} (Variant ${colorVariant + 1})`,
    };
  }

  private randomItem<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot select from an empty collection');
    }
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
}
