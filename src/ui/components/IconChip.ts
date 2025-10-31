import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/theme';

export interface IconChipConfig {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderColor?: string;
  label: string;
  sublabel?: string;
}

export class IconChip extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private labelText: Phaser.GameObjects.Text;
  private sublabelText?: Phaser.GameObjects.Text;
  private readonly width: number;
  private readonly height: number;
  private readonly defaultBackgroundColor: number;
  private readonly hoverBackgroundColor: number;

  constructor(scene: Phaser.Scene, config: IconChipConfig) {
    super(scene);

    this.width = config.width ?? 136;
    this.height = config.height ?? 48;
    const backgroundColor = config.backgroundColor ?? COLORS.surface;
    const borderColor = config.borderColor ?? COLORS.border;

    this.defaultBackgroundColor = Phaser.Display.Color.HexStringToColor(backgroundColor).color;
    const hoverColor = Phaser.Display.Color.HexStringToColor(COLORS.primaryLight).clone();
    hoverColor.saturate(20);
    this.hoverBackgroundColor = hoverColor.color;

    this.border = scene.add.rectangle(0, 0, this.width, this.height);
    this.border.setOrigin(0.5);
    this.border.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(borderColor).color, 0.85);
    this.add(this.border);

    this.background = scene.add.rectangle(0, 0, this.width - 4, this.height - 4);
    this.background.setOrigin(0.5);
    this.background.setFillStyle(this.defaultBackgroundColor, 0.85);
    this.add(this.background);

    this.labelText = scene.add.text(0, -SPACING.xs, config.label, {
      fontSize: `${TYPOGRAPHY.fontSize.base}px`,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      color: COLORS.textPrimary,
      align: 'center',
      wordWrap: { width: this.width - SPACING.md * 2 },
    });
    this.labelText.setOrigin(0.5);
    this.add(this.labelText);

    if (config.sublabel) {
      this.sublabelText = scene.add.text(0, TYPOGRAPHY.fontSize.base * 0.5, config.sublabel, {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        align: 'center',
        wordWrap: { width: this.width - SPACING.md * 2 },
      });
      this.sublabelText.setOrigin(0.5);
      this.add(this.sublabelText);
    }

    this.setSize(this.width, this.height);
    this.setInteractive(new Phaser.Geom.Rectangle(-this.width / 2, -this.height / 2, this.width, this.height), Phaser.Geom.Rectangle.Contains);
    scene.add.existing(this);
  }

  public setLabels(label: string, sublabel?: string): void {
    this.labelText.setText(label);

    if (sublabel) {
      if (!this.sublabelText) {
        this.sublabelText = this.scene.add.text(
          0,
          TYPOGRAPHY.fontSize.base * 0.5,
          sublabel,
          {
            fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
            fontFamily: TYPOGRAPHY.fontFamily.primary,
            color: COLORS.textSecondary,
            align: 'center',
            wordWrap: { width: this.width - SPACING.md * 2 },
          }
        );
        this.sublabelText.setOrigin(0.5);
        this.add(this.sublabelText);
      } else {
        this.sublabelText.setText(sublabel);
        this.sublabelText.setVisible(true);
      }
    } else if (this.sublabelText) {
      this.sublabelText.setVisible(false);
    }
  }

  public setHoverState(isHovering: boolean): void {
    const targetColor = isHovering ? this.hoverBackgroundColor : this.defaultBackgroundColor;
    this.background.setFillStyle(targetColor, 0.9);
  }

  public setAccentColor(colorHex: string): void {
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    this.border.setStrokeStyle(2, color, 0.95);
  }
}
