/**
 * BrutoNameValidator - Validates bruto names using repository checks and profanity filtering.
 */

import { BrutoRepository } from '../database/repositories/BrutoRepository';
import { Result, err, ok } from '../utils/result';
import { ErrorCodes } from '../utils/errors';
import { Validators } from '../utils/validators';

const DEFAULT_PROFANITY: string[] = [
  'badword',
  'offense',
  'curse',
  'dummy'
];

export class BrutoNameValidator {
  constructor(
    private readonly repository: BrutoRepository,
    private readonly profanityList: string[] = DEFAULT_PROFANITY
  ) {}

  public async validate(name: string, userId: string): Promise<Result<true>> {
    const base = Validators.validateBrutoName(name);
    if (!base.success) {
      return base;
    }

    if (this.containsProfanity(name)) {
      return err('Please choose a different name (profanity detected)', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    const uniqueResult = await this.repository.isNameUnique(userId, name);
    if (!uniqueResult.success) {
      return err(uniqueResult.error, uniqueResult.code);
    }

    if (!uniqueResult.data) {
      return err('You already have a bruto with that name', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    return ok(true);
  }

  private containsProfanity(name: string): boolean {
    const candidate = name.toLowerCase();
    return this.profanityList.some((word) => word && candidate.includes(word.toLowerCase()));
  }
}
