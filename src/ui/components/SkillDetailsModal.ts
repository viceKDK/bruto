/**
 * SkillDetailsModal - Story 6.7
 * Modal that displays full skill details including all effects, conditions, and metadata
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, SPACING, LAYOUT } from '../../utils/theme';
import { Skill, SkillEffectTiming } from '../../models/Skill';
import { Panel } from './Panel';
import { Button } from './Button';

export interface SkillDetailsModalConfig {
  skill: Skill;
  onClose: () => void;
}

export class SkillDetailsModal extends Phaser.GameObjects.Container {
  private readonly backdrop: Phaser.GameObjects.Rectangle;
  private readonly panel: Panel;
  private readonly closeButton: Button;

  constructor(scene: Phaser.Scene, config: SkillDetailsModalConfig) {
    super(scene, 0, 0);

    const { width, height } = scene.cameras.main;

    // Semi-transparent backdrop
    this.backdrop = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      parseInt(COLORS.overlay.replace('#', '0x')),
      0.85
    );
    this.backdrop.setInteractive();
    this.backdrop.setDepth(LAYOUT.zIndex.modal - 1);

    // Modal panel
    const modalWidth = Math.min(600, width * 0.9);
    const modalHeight = Math.min(500, height * 0.85);

    this.panel = new Panel(scene, {
      x: width / 2,
      y: height / 2,
      width: modalWidth,
      height: modalHeight,
      title: config.skill.name,
      backgroundColor: COLORS.surface,
      borderColor: COLORS.primary,
      borderWidth: 3,
    });
    this.panel.setDepth(LAYOUT.zIndex.modal);

    // Close button
    this.closeButton = new Button(scene, {
      x: width / 2 + modalWidth / 2 - 60,
      y: height / 2 - modalHeight / 2 + 40,
      width: 100,
      height: 36,
      text: 'Cerrar',
      backgroundColor: COLORS.danger,
      hoverColor: COLORS.dangerLight,
      textColor: COLORS.textPrimary,
      onClick: () => config.onClose(),
    });
    this.closeButton.setDepth(LAYOUT.zIndex.modal + 1);

    // Content area
    this.renderSkillContent(scene, config.skill, modalWidth, modalHeight, width, height);

    this.add([this.backdrop, this.panel, this.closeButton]);
    this.setDepth(LAYOUT.zIndex.modal);
    scene.add.existing(this);
  }

  private renderSkillContent(
    scene: Phaser.Scene,
    skill: Skill,
    modalWidth: number,
    modalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    const contentX = screenWidth / 2;
    const contentY = screenHeight / 2 - modalHeight / 2 + 80;
    const contentWidth = modalWidth - SPACING.xl * 2;
    let currentY = contentY;

    // Category badge
    const categoryLabels: Record<string, string> = {
      stat_buff: '📈 Mejora de Stats',
      armor: '🛡️ Armadura',
      active_ability: '⚡ Habilidad Activa',
      combat_modifier: '⚔️ Modificador de Combate',
      healing: '💚 Curación',
      poison: '☠️ Veneno',
      passive_effect: '🔮 Efecto Pasivo',
      resistance_modifier: '🛡️ Modificador de Resistencia',
    };

    const categoryText = scene.add.text(
      contentX,
      currentY,
      categoryLabels[skill.category] || skill.category,
      {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );
    categoryText.setOrigin(0.5, 0);
    categoryText.setDepth(LAYOUT.zIndex.modal + 2);
    this.add(categoryText);
    currentY += categoryText.height + SPACING.md;

    // Description
    if (skill.description) {
      const descText = scene.add.text(contentX, currentY, skill.description, {
        fontSize: `${TYPOGRAPHY.fontSize.md}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        wordWrap: { width: contentWidth },
        align: 'center',
      });
      descText.setOrigin(0.5, 0);
      descText.setDepth(LAYOUT.zIndex.modal + 2);
      this.add(descText);
      currentY += descText.height + SPACING.lg;
    }

    // Divider
    const divider1 = scene.add.rectangle(
      contentX,
      currentY,
      contentWidth,
      2,
      parseInt(COLORS.border.replace('#', '0x')),
      0.5
    );
    divider1.setDepth(LAYOUT.zIndex.modal + 2);
    this.add(divider1);
    currentY += SPACING.md;

    // Effects section
    const effectsTitle = scene.add.text(contentX, currentY, 'EFECTOS', {
      fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontStyle: 'bold',
    });
    effectsTitle.setOrigin(0.5, 0);
    effectsTitle.setDepth(LAYOUT.zIndex.modal + 2);
    this.add(effectsTitle);
    currentY += effectsTitle.height + SPACING.sm;

    // Render each effect
    skill.effects?.forEach((effect) => {
      const effectLines: string[] = [];

      // Timing badge
      const timingLabels: Record<SkillEffectTiming, string> = {
        [SkillEffectTiming.IMMEDIATE]: '⚡ Inmediato',
        [SkillEffectTiming.PASSIVE]: '🔁 Pasivo',
        [SkillEffectTiming.ON_LEVEL_UP]: '⬆️ Al subir nivel',
        [SkillEffectTiming.ON_COMBAT_START]: '⚔️ Inicio de combate',
        [SkillEffectTiming.PER_TURN]: '🔄 Por turno',
        [SkillEffectTiming.ON_HIT]: '💥 Al golpear',
        [SkillEffectTiming.CONDITIONAL]: '❓ Condicional',
      };

      effectLines.push(timingLabels[effect.timing] || effect.timing);

      // Effect details
      if (effect.stat && effect.value !== undefined) {
        const sign = effect.value >= 0 ? '+' : '';
        let valueStr = `${sign}${effect.value}`;
        
        if (effect.modifier === 'percentage') {
          valueStr += '%';
        } else if (effect.modifier === 'both') {
          valueStr += ' (flat + %)';
        }

        effectLines.push(`${effect.stat.toUpperCase()}: ${valueStr}`);
      }

      if (effect.condition) {
        effectLines.push(`Condición: ${effect.condition}`);
      }

      if (effect.target) {
        const targetLabels = {
          self: 'Auto',
          opponent: 'Oponente',
          both: 'Ambos',
        };
        effectLines.push(`Objetivo: ${targetLabels[effect.target]}`);
      }

      const effectText = scene.add.text(
        contentX - contentWidth / 2 + SPACING.md,
        currentY,
        '• ' + effectLines.join(' | '),
        {
          fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
          color: COLORS.textPrimary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          wordWrap: { width: contentWidth - SPACING.md * 2 },
        }
      );
      effectText.setOrigin(0, 0);
      effectText.setDepth(LAYOUT.zIndex.modal + 2);
      this.add(effectText);
      currentY += effectText.height + SPACING.xs;
    });

    currentY += SPACING.sm;

    // Divider
    const divider2 = scene.add.rectangle(
      contentX,
      currentY,
      contentWidth,
      2,
      parseInt(COLORS.border.replace('#', '0x')),
      0.5
    );
    divider2.setDepth(LAYOUT.zIndex.modal + 2);
    this.add(divider2);
    currentY += SPACING.md;

    // Metadata section
    const metadataLines: string[] = [];

    if (skill.stackable) {
      metadataLines.push(`🔁 Acumulable (máx: ${skill.maxStacks ?? 1})`);
    } else {
      metadataLines.push('❌ No acumulable');
    }

    if (skill.mutuallyExclusiveWith && skill.mutuallyExclusiveWith.length > 0) {
      metadataLines.push(`⚠️ Incompatible con: ${skill.mutuallyExclusiveWith.join(', ')}`);
    }

    if (skill.odds) {
      metadataLines.push(`🎲 Probabilidad: ${skill.odds}`);
    }

    if (metadataLines.length > 0) {
      const metaText = scene.add.text(
        contentX,
        currentY,
        metadataLines.join('\n'),
        {
          fontSize: `${TYPOGRAPHY.fontSize.xs}px`,
          color: COLORS.textSecondary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          align: 'center',
          wordWrap: { width: contentWidth },
        }
      );
      metaText.setOrigin(0.5, 0);
      metaText.setDepth(LAYOUT.zIndex.modal + 2);
      this.add(metaText);
    }
  }

  public close(): void {
    this.destroy();
  }

  override destroy(fromScene?: boolean): void {
    this.backdrop.destroy();
    this.panel.destroy();
    this.closeButton.destroy();
    super.destroy(fromScene);
  }
}
