import Phaser from 'phaser';
import { Panel } from './Panel';
import { IconChip } from './IconChip';
import { Tooltip } from './Tooltip';
import { COLORS, TYPOGRAPHY, SPACING, LAYOUT } from '../../utils/theme';
import { StatsSummary, StatValueSummary, DerivedStatSummary } from '../../engine/StatsCalculator';

type StatusTone = 'info' | 'error';

export interface AugmenterChipData {
  id: string;
  name: string;
  bonus: string;
  description: string;
}

export interface PetChipData {
  id: string;
  name: string;
  resistanceCost: number;
  description: string;
  acquiredAtLevel?: number;
}

export interface ModifierSummary {
  augmenters: AugmenterChipData[];
  pets: PetChipData[];
}

interface StatRow {
  label: Phaser.GameObjects.Text;
  base: Phaser.GameObjects.Text;
  effective: Phaser.GameObjects.Text;
  delta: Phaser.GameObjects.Text;
}

const CHIP_WIDTH = 140;
const CHIP_HEIGHT = 52;
const CHIP_GAP_X = SPACING.sm;
const CHIP_GAP_Y = SPACING.sm;

export class StatsPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly headerTexts: Phaser.GameObjects.Text[];
  private readonly statRows = new Map<string, StatRow>();
  private readonly derivedTexts: Phaser.GameObjects.Text[] = [];
  private readonly augmenterChips: IconChip[] = [];
  private readonly petChips: IconChip[] = [];
  private statusText?: Phaser.GameObjects.Text;
  private augmenterLabel?: Phaser.GameObjects.Text;
  private petLabel?: Phaser.GameObjects.Text;
  private augmentersEmptyText?: Phaser.GameObjects.Text;
  private petsEmptyText?: Phaser.GameObjects.Text;
  private readonly tooltip: Tooltip;

  private readonly paddingX = SPACING.lg;
  private readonly paddingY = SPACING.lg;
  private readonly lineHeight = TYPOGRAPHY.fontSize.base + SPACING.sm;
  private readonly columns: { labelX: number; baseX: number; effectiveX: number; deltaX: number };

  constructor(private readonly scene: Phaser.Scene, private readonly panel: Panel) {
    const contentWidth = panel.getContentWidth();
    this.columns = {
      labelX: -contentWidth / 2 + this.paddingX,
      baseX: -contentWidth / 2 + this.paddingX + contentWidth * 0.48,
      effectiveX: -contentWidth / 2 + this.paddingX + contentWidth * 0.72,
      deltaX: -contentWidth / 2 + this.paddingX + contentWidth * 0.92,
    };

    this.container = scene.add.container(0, 0);
    panel.add(this.container);

    this.headerTexts = this.createHeaderRow();
    this.tooltip = new Tooltip(scene, {
      maxWidth: Math.min(contentWidth, 320),
      padding: SPACING.sm,
    });
    this.tooltip.setDepth(LAYOUT.zIndex.tooltip);
    this.tooltip.hide();
  }

  public showLoading(): void {
    this.showStatus('Cargando estadísticas...', 'info');
  }

  public showStatus(message: string, tone: StatusTone): void {
    this.container.setVisible(false);
    this.tooltip.hide();

    if (!this.statusText) {
      this.statusText = this.scene.add.text(0, 0, message, {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: tone === 'error' ? COLORS.error : COLORS.info,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        align: 'center',
        wordWrap: { width: this.panel.getContentWidth() - this.paddingX * 2 },
      });
      this.statusText.setOrigin(0.5);
      this.panel.add(this.statusText);
      return;
    }

    this.statusText.setText(message);
    this.statusText.setColor(tone === 'error' ? COLORS.error : COLORS.info);
    this.statusText.setVisible(true);
  }

  public update(summary: StatsSummary, modifiers?: ModifierSummary): void {
    this.container.setVisible(true);
    this.clearStatus();

    this.repositionHeader();
    this.ensureRows(summary.primary);
    this.positionRows(summary.primary);
    this.updatePrimaryRows(summary.primary);

    let nextY = this.layoutDerivedStats(summary.derived, summary.primary.length);
    nextY = this.layoutAugmenterSection(modifiers?.augmenters ?? [], nextY);
    this.layoutPetSection(modifiers?.pets ?? [], nextY);
  }

  public destroy(): void {
    this.tooltip.destroy();
    this.container.destroy(true);
    this.statusText?.destroy();
    this.augmenterLabel?.destroy();
    this.petLabel?.destroy();
    this.augmentersEmptyText?.destroy();
    this.petsEmptyText?.destroy();

    this.derivedTexts.forEach((text) => text.destroy());
    this.augmenterChips.forEach((chip) => chip.destroy());
    this.petChips.forEach((chip) => chip.destroy());
    this.headerTexts.forEach((text) => text.destroy());

    this.statRows.forEach((row) => {
      row.label.destroy();
      row.base.destroy();
      row.effective.destroy();
      row.delta.destroy();
    });
    this.statRows.clear();
  }

  private createHeaderRow(): Phaser.GameObjects.Text[] {
    const headerStyle = {
      fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontStyle: 'bold',
    };

    const label = this.scene.add.text(0, 0, 'Estadística', headerStyle);
    label.setOrigin(0, 0.5);
    const base = this.scene.add.text(0, 0, 'Base', headerStyle);
    base.setOrigin(1, 0.5);
    const effective = this.scene.add.text(0, 0, 'Efectiva', headerStyle);
    effective.setOrigin(1, 0.5);
    const delta = this.scene.add.text(0, 0, 'Δ', headerStyle);
    delta.setOrigin(1, 0.5);

    this.container.add(label);
    this.container.add(base);
    this.container.add(effective);
    this.container.add(delta);

    return [label, base, effective, delta];
  }

  private repositionHeader(): void {
    const headerY = -this.panel.getContentHeight() / 2 + this.paddingY;
    this.headerTexts[0].setPosition(this.columns.labelX, headerY);
    this.headerTexts[1].setPosition(this.columns.baseX, headerY);
    this.headerTexts[2].setPosition(this.columns.effectiveX, headerY);
    this.headerTexts[3].setPosition(this.columns.deltaX, headerY);
  }

  private ensureRows(primary: StatValueSummary[]): void {
    primary.forEach((stat) => {
      if (this.statRows.has(stat.key)) {
        return;
      }

      const label = this.scene.add.text(0, 0, stat.label, {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      });
      label.setOrigin(0, 0.5);

      const base = this.scene.add.text(0, 0, '', {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      });
      base.setOrigin(1, 0.5);

      const effective = this.scene.add.text(0, 0, '', {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      });
      effective.setOrigin(1, 0.5);

      const delta = this.scene.add.text(0, 0, '', {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      });
      delta.setOrigin(1, 0.5);

      this.container.add(label);
      this.container.add(base);
      this.container.add(effective);
      this.container.add(delta);

      this.statRows.set(stat.key, { label, base, effective, delta });
    });
  }

  private positionRows(primary: StatValueSummary[]): void {
    const contentTop = -this.panel.getContentHeight() / 2 + this.paddingY;
    primary.forEach((stat, index) => {
      const row = this.statRows.get(stat.key);
      if (!row) return;

      const y = contentTop + this.lineHeight * (index + 1);
      row.label.setPosition(this.columns.labelX, y);
      row.base.setPosition(this.columns.baseX, y);
      row.effective.setPosition(this.columns.effectiveX, y);
      row.delta.setPosition(this.columns.deltaX, y);
    });
  }

  private updatePrimaryRows(primary: StatValueSummary[]): void {
    primary.forEach((stat) => {
      const row = this.statRows.get(stat.key);
      if (!row) return;

      row.label.setText(stat.label);
      row.base.setText(this.formatValue(stat.base));
      row.effective.setText(this.formatValue(stat.effective));

      const deltaValue = this.formatDelta(stat.delta);
      row.delta.setText(deltaValue);

      if (stat.delta > 0) {
        row.delta.setColor(COLORS.success);
      } else if (stat.delta < 0) {
        row.delta.setColor(COLORS.error);
      } else {
        row.delta.setColor(COLORS.textSecondary);
      }

      if (stat.breakdown.length > 0) {
        row.label.setData('breakdown', stat.breakdown.join('\n'));
        row.label.setTintFill(this.hexToColor(COLORS.info));
      } else {
        row.label.removeData('breakdown');
        row.label.clearTint();
      }
    });
  }

  private layoutDerivedStats(derived: DerivedStatSummary[], primaryCount: number): number {
    const contentTop = -this.panel.getContentHeight() / 2 + this.paddingY;
    const startY = contentTop + this.lineHeight * (primaryCount + 1) + SPACING.sm;

    derived.forEach((stat, index) => {
      let text = this.derivedTexts[index];
      if (!text) {
        text = this.scene.add.text(this.columns.labelX, 0, '', {
          fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
          color: COLORS.textSecondary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
        });
        text.setOrigin(0, 0.5);
        this.container.add(text);
        this.derivedTexts[index] = text;
      }

      const y = startY + index * (TYPOGRAPHY.fontSize.sm + SPACING.xs);
      text.setPosition(this.columns.labelX, y);
      text.setText(
        `${stat.label}: ${this.formatValue(stat.value)}${stat.unit} (${stat.description})`
      );
      text.setVisible(true);
    });

    for (let i = derived.length; i < this.derivedTexts.length; i += 1) {
      this.derivedTexts[i].setVisible(false);
    }

    const derivedHeight =
      derived.length > 0
        ? derived.length * (TYPOGRAPHY.fontSize.sm + SPACING.xs)
        : 0;

    return startY + derivedHeight + SPACING.md;
  }

  private layoutAugmenterSection(augmenters: AugmenterChipData[], startY: number): number {
    const label = this.ensureSectionLabel('Habilidades Augmenter', 'augmenter');
    const emptyText = this.ensureEmptyState('augmenter', 'Sin Habilidades Augmenter equipadas.');

    const labelY = startY;
    label.setPosition(this.columns.labelX, labelY);

    if (augmenters.length === 0) {
      emptyText.setPosition(this.columns.labelX, labelY + this.lineHeight);
      emptyText.setVisible(true);
      this.hideChips(this.augmenterChips);
      return labelY + this.lineHeight * 2;
    }

    emptyText.setVisible(false);

    this.ensureChipPool(this.augmenterChips, augmenters.length, COLORS.info);
    const chipsBottom = this.layoutChips(
      this.augmenterChips,
      augmenters.map((entry) => ({
        label: entry.name,
        sublabel: entry.bonus,
        tooltip: `${entry.name}\n${entry.description}`,
      })),
      labelY + this.lineHeight
    );

    return chipsBottom + SPACING.sm;
  }

  private layoutPetSection(pets: PetChipData[], startY: number): number {
    const label = this.ensureSectionLabel('Mascotas Activas', 'pets');
    const emptyText = this.ensureEmptyState('pets', 'Sin mascotas adquiridas.');

    label.setPosition(this.columns.labelX, startY);

    if (pets.length === 0) {
      emptyText.setPosition(this.columns.labelX, startY + this.lineHeight);
      emptyText.setVisible(true);
      this.hideChips(this.petChips);
      return startY + this.lineHeight * 2;
    }

    emptyText.setVisible(false);

    this.ensureChipPool(this.petChips, pets.length, COLORS.success);
    const chipsBottom = this.layoutChips(
      this.petChips,
      pets.map((entry) => ({
        label: entry.name,
        sublabel: `RES -${entry.resistanceCost}${entry.acquiredAtLevel ? ` · Nivel ${entry.acquiredAtLevel}` : ''}`,
        tooltip: `${entry.name}\n${entry.description}\nCoste de resistencia: -${entry.resistanceCost}`,
      })),
      startY + this.lineHeight
    );

    return chipsBottom;
  }

  private ensureSectionLabel(text: string, key: 'augmenter' | 'pets'): Phaser.GameObjects.Text {
    const existing =
      key === 'augmenter' ? this.augmenterLabel : this.petLabel;
    if (existing) {
      existing.setText(text);
      existing.setVisible(true);
      return existing;
    }

    const label = this.scene.add.text(this.columns.labelX, 0, text, {
      fontSize: `${TYPOGRAPHY.fontSize.base}px`,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontStyle: 'bold',
    });
    label.setOrigin(0, 0.5);
    this.container.add(label);

    if (key === 'augmenter') {
      this.augmenterLabel = label;
    } else {
      this.petLabel = label;
    }
    return label;
  }

  private ensureEmptyState(
    key: 'augmenter' | 'pets',
    message: string
  ): Phaser.GameObjects.Text {
    const existing =
      key === 'augmenter' ? this.augmentersEmptyText : this.petsEmptyText;
    if (existing) {
      existing.setText(message);
      return existing;
    }

    const text = this.scene.add.text(this.columns.labelX, 0, message, {
      fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
    });
    text.setOrigin(0, 0.5);
    text.setVisible(false);
    this.container.add(text);

    if (key === 'augmenter') {
      this.augmentersEmptyText = text;
    } else {
      this.petsEmptyText = text;
    }
    return text;
  }

  private ensureChipPool(chips: IconChip[], required: number, accentColor: string): void {
    while (chips.length < required) {
      const chip = new IconChip(this.scene, {
        width: CHIP_WIDTH,
        height: CHIP_HEIGHT,
        label: '',
      });
      chip.setAccentColor(accentColor);
      this.container.add(chip);
      chips.push(chip);
    }

    chips.forEach((chip) => {
      chip.setVisible(false);
      chip.removeAllListeners();
      chip.setHoverState(false);
    });
  }

  private layoutChips(
    chips: IconChip[],
    data: { label: string; sublabel?: string; tooltip: string }[],
    startY: number
  ): number {
    const contentWidth = this.panel.getContentWidth();
    const contentLeft = -contentWidth / 2 + this.paddingX;
    const contentRight = contentLeft + contentWidth - this.paddingX * 0.5;

    let currentX = contentLeft + CHIP_WIDTH / 2;
    let currentY = startY + CHIP_HEIGHT / 2;
    let maxY = currentY + CHIP_HEIGHT / 2;

    data.forEach((entry, index) => {
      const chip = chips[index];
      chip.setVisible(true);
      chip.setLabels(entry.label, entry.sublabel);
      chip.setPosition(currentX, currentY);

      this.attachTooltip(chip, entry.tooltip);

      currentX += CHIP_WIDTH + CHIP_GAP_X;
      if (currentX + CHIP_WIDTH / 2 > contentRight) {
        currentX = contentLeft + CHIP_WIDTH / 2;
        currentY += CHIP_HEIGHT + CHIP_GAP_Y;
        maxY = currentY + CHIP_HEIGHT / 2;
      } else {
        maxY = Math.max(maxY, currentY + CHIP_HEIGHT / 2);
      }
    });

    return maxY + SPACING.sm;
  }

  private attachTooltip(chip: IconChip, content: string): void {
    chip.on('pointerover', (pointer: Phaser.Input.Pointer) => {
      chip.setHoverState(true);
      this.tooltip.showAt(pointer.worldX + 14, pointer.worldY, content);
    });

    chip.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.tooltip.visible) {
        this.tooltip.moveTo(pointer.worldX + 14, pointer.worldY);
      }
    });

    chip.on('pointerout', () => {
      chip.setHoverState(false);
      this.tooltip.hide();
    });
  }

  private hideChips(chips: IconChip[]): void {
    chips.forEach((chip) => {
      chip.setVisible(false);
      chip.removeAllListeners();
      chip.setHoverState(false);
    });
  }

  private clearStatus(): void {
    if (this.statusText) {
      this.statusText.setVisible(false);
    }
  }

  private formatValue(value: number): string {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
  }

  private formatDelta(delta: number): string {
    if (Math.abs(delta) < 0.001) {
      return '0';
    }
    const rounded = this.formatValue(delta);
    return delta > 0 ? `+${rounded}` : rounded;
  }

  private hexToColor(color: string): number {
    return Phaser.Display.Color.HexStringToColor(color).color;
  }
}
