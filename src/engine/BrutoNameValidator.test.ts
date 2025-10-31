import { describe, expect, it } from 'vitest';
import { BrutoNameValidator } from './BrutoNameValidator';
import { Result, ok } from '../utils/result';

class FakeBrutoRepository {
  private readonly names = new Map<string, Set<string>>();

  async isNameUnique(userId: string, name: string): Promise<Result<boolean>> {
    const existing = this.names.get(userId);
    if (!existing) {
      return ok(true);
    }
    return ok(!existing.has(name.toLowerCase()));
  }

  public addName(userId: string, name: string): void {
    const normalized = name.toLowerCase();
    if (!this.names.has(userId)) {
      this.names.set(userId, new Set());
    }
    this.names.get(userId)!.add(normalized);
  }
}

describe('BrutoNameValidator', () => {
  it('fails profanity and duplicate checks', async () => {
    const repo = new FakeBrutoRepository();
    repo.addName('user1', 'hero');
    const validator = new BrutoNameValidator(repo as any, ['evil']);

    const profanity = await validator.validate('Evil Lord', 'user1');
    expect(profanity.success).toBe(false);

    const duplicate = await validator.validate('Hero', 'user1');
    expect(duplicate.success).toBe(false);
  });

  it('accepts valid unique names', async () => {
    const repo = new FakeBrutoRepository();
    const validator = new BrutoNameValidator(repo as any, ['evil']);

    const result = await validator.validate('Brave One', 'user2');
    expect(result.success).toBe(true);
  });
});
