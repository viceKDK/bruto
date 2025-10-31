import { BaseRepository } from './BaseRepository';
import { DatabaseManager } from '../DatabaseManager';
import { Result, ok } from '../../utils/result';

export interface LevelUpChoice {
  id: string;
  brutoId: string;
  level: number;
  optionA: string;
  optionB: string;
  chosenOption: 'A' | 'B';
  chosenAt: Date;
}

type LevelUpRow = {
  id: string;
  bruto_id: string;
  level: number;
  option_a: string;
  option_b: string;
  chosen_option: string;
  chosen_at: number;
};

export class LevelUpHistoryRepository extends BaseRepository<LevelUpChoice> {
  constructor(db: DatabaseManager) {
    super(db);
  }

  protected getTableName(): string {
    return 'level_up_history';
  }

  protected mapRowToEntity(row: LevelUpRow): LevelUpChoice {
    const chosen = row.chosen_option === 'B' ? 'B' : 'A';

    return {
      id: row.id,
      brutoId: row.bruto_id,
      level: row.level,
      optionA: row.option_a,
      optionB: row.option_b,
      chosenOption: chosen,
      chosenAt: new Date(row.chosen_at),
    };
  }

  protected mapEntityToRow(entity: LevelUpChoice): LevelUpRow {
    return {
      id: entity.id,
      bruto_id: entity.brutoId,
      level: entity.level,
      option_a: entity.optionA,
      option_b: entity.optionB,
      chosen_option: entity.chosenOption,
      chosen_at: entity.chosenAt.getTime(),
    };
  }

  async findByBrutoId(brutoId: string): Promise<Result<LevelUpChoice[]>> {
    const result = await this.queryMany(
      `SELECT * FROM ${this.getTableName()} WHERE bruto_id = ? ORDER BY level DESC`,
      [brutoId]
    );

    if (!result.success) {
      return result;
    }

    return ok(
      result.data.map((entry) => ({
        ...entry,
        chosenOption: entry.chosenOption === 'B' ? 'B' : 'A',
      }))
    );
  }
}
