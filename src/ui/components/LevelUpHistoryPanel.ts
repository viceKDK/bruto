import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/theme';
import { formatTimestamp } from '../../scenes/BrutoDetailsScene.helpers';

export interface LevelUpHistoryEntry {
  id: string;
  level: number;
  optionA: string;
  optionB: string;
  chosenOption: 'A' | 'B';
  chosenAt: Date;
}

export interface LevelUpHistoryPanelConfig {
  width: number;
  height: number;
  maxVisibleEntries?: number;
}

const ENTRY_VERTICAL_GAP = SPACING.sm;
const DETAILS_FONT_SIZE = TYPOGRAPHY.fontSize.sm;

export class LevelUpHistoryPanel extends Phaser.GameObjects.Container {
  private readonly config: LevelUpHistoryPanelConfig;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly entriesContainer: Phaser.GameObjects.Container;
  private entryViews: Array<{ container: Phaser.GameObjects.Container; details: Phaser.GameObjects.Text }> = [];

  constructor(scene: Phaser.Scene, config: LevelUpHistoryPanelConfig) {
    super(scene, 0, 0);
    this.config = config;

    const background = scene.add.rectangle(
      0,
      0,
      config.width,
      config.height,
      Phaser.Display.Color.HexStringToColor(COLORS.surface).color,
      0.45
    );
    background.setOrigin(0.5);
    this.add(background);

    this.statusText = scene.add.text(0, 0, 'Cargando historial...', {
      fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      align: 'center',
      wordWrap: { width: config.width - SPACING.lg },
    });
    this.statusText.setOrigin(0.5);
    this.add(this.statusText);

    this.entriesContainer = scene.add.container(-config.width / 2 + SPACING.md, -config.height / 2 + SPACING.md);
    this.add(this.entriesContainer);
    this.entriesContainer.setVisible(false);

    scene.add.existing(this);
  }

  public setLoading(message = 'Cargando historial...'): void {
    this.clearEntries();
    this.statusText.setText(message);
    this.statusText.setVisible(true);
    this.entriesContainer.setVisible(false);
  }

  public setEntries(entries: LevelUpHistoryEntry[]): void {
    this.clearEntries();

    if (entries.length === 0) {
      this.statusText.setText('No hay historial de nivel disponible.');
      this.statusText.setVisible(true);
      return;
    }

    this.statusText.setVisible(false);
    this.entriesContainer.setVisible(true);

    let currentY = 0;
    const maxHeight = this.config.height - SPACING.md * 2;

    entries.forEach((entry, index) => {
      if (currentY > maxHeight) {
        return;
      }

      const entryContainer = this.scene.add.container(0, currentY);
      const header = this.createHeader(entry);
      entryContainer.add(header);

      const details = this.createDetails(entry);
      details.setVisible(false);
      entryContainer.add(details);

      const toggleZone = this.scene.add.zone(0, 0, this.config.width - SPACING.md * 2, header.height);
      toggleZone.setOrigin(0, 0);
      toggleZone.setInteractive({ useHandCursor: true });
      entryContainer.add(toggleZone);

      toggleZone.on('pointerdown', () => {
        const visible = !details.visible;
        details.setVisible(visible);
        this.layoutEntryDetails(entryContainer, header, details);
        this.reflowEntries();
      });

      this.entryViews.push({ container: entryContainer, details });

      this.entriesContainer.add(entryContainer);
      currentY += header.height + ENTRY_VERTICAL_GAP;
    });

    this.reflowEntries();
  }

  private createHeader(entry: LevelUpHistoryEntry): Phaser.GameObjects.Text {
    const chosenLabel = entry.chosenOption === 'A' ? entry.optionA : entry.optionB;
    const timestamp = formatTimestamp(entry.chosenAt);
    const text = `Nivel ${entry.level} · Eleccion: ${chosenLabel} (${timestamp})`;

    return this.scene.add.text(0, 0, text, {
      fontSize: `${TYPOGRAPHY.fontSize.base}px`,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
    });
  }

  private createDetails(entry: LevelUpHistoryEntry): Phaser.GameObjects.Text {
    const selectedPrefix = entry.chosenOption === 'A' ? '▶ ' : '  ';
    const otherPrefix = entry.chosenOption === 'B' ? '▶ ' : '  ';

    const content = [
      `${selectedPrefix}Opcion A: ${entry.optionA}`,
      `${otherPrefix}Opcion B: ${entry.optionB}`,
    ].join('\n');

    const details = this.scene.add.text(0, TYPOGRAPHY.fontSize.base + SPACING.xs, content, {
      fontSize: `${DETAILS_FONT_SIZE}px`,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      wordWrap: { width: this.config.width - SPACING.md * 2 },
    });

    return details;
  }

  private layoutEntryDetails(
    container: Phaser.GameObjects.Container,
    header: Phaser.GameObjects.Text,
    details: Phaser.GameObjects.Text
  ): void {
    header.setPosition(0, 0);
    details.setPosition(0, header.height + SPACING.xs);

    const height = header.height + (details.visible ? details.height + SPACING.xs : 0);
    container.setSize(this.config.width - SPACING.md * 2, height);
  }

  private reflowEntries(): void {
    let offsetY = 0;
    this.entryViews.forEach(({ container, details }) => {
      container.setY(offsetY);
      offsetY += container.height + ENTRY_VERTICAL_GAP;
      details.setVisible(details.visible);
    });
  }

  private clearEntries(): void {
    this.entryViews.forEach(({ container }) => container.destroy());
    this.entryViews = [];
    this.entriesContainer.removeAll(true);
  }

  override destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
    this.entryViews.forEach(({ container }) => container.destroy());
    this.statusText.destroy();
    this.entriesContainer.destroy();
  }
}
