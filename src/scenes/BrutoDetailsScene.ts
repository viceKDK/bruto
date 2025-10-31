/**
 * BrutoDetailsScene - Casillero UI (Epic 3)
 * Displays bruto stats, weapons, skills, and battle history with responsive layout
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/theme';
import { Panel } from '../ui/components/Panel';
import { Button } from '../ui/components/Button';
import { WeaponRack, WeaponSlot } from '../ui/components/WeaponRack';
import { SkillGrid, SkillCell } from '../ui/components/SkillGrid';
import { BattleHistoryPanel } from '../ui/components/BattleHistoryPanel';
import { StatsPanel as StatsPanelDisplay, type ModifierSummary, type PetChipData } from '../ui/components/StatsPanel';
import {
  LevelUpHistoryPanel,
  type LevelUpHistoryEntry,
} from '../ui/components/LevelUpHistoryPanel';
import { XPBar } from '../components/XPBar';
import { StatsCalculator } from '../engine/StatsCalculator';
import { useStore } from '../state/store';
import { DatabaseManager } from '../database/DatabaseManager';
import { BrutoRepository } from '../database/repositories/BrutoRepository';
import { BrutoPetRepository } from '../database/repositories/BrutoPetRepository';
import { BattleLoggerService, IBattleLog } from '../services/BattleLoggerService';
import {
  LevelUpHistoryRepository,
  type LevelUpChoice,
} from '../database/repositories/LevelUpHistoryRepository';
import { IBruto } from '../models/Bruto';
import {
  formatWeaponName,
  formatSkillName,
  generateStubBattleLogEntries,
  mapAugmenterSkills,
  mapPetRecords,
} from './BrutoDetailsScene.helpers';

type FrameInfo = {
  scale: number;
  offsetX: number;
  offsetY: number;
  stackedLayout: boolean;
};

export class BrutoDetailsScene extends Phaser.Scene {
  private static readonly DESIGN_WIDTH = 1280;
  private static readonly DESIGN_HEIGHT = 720;

  private static readonly PANEL_LAYOUT = {
    stats: { x: 340, y: 330, width: 520, height: 320, title: 'Estadisticas' },
    weapons: { x: 940, y: 330, width: 520, height: 220, title: 'Armas' },
    skills: { x: 340, y: 636, width: 520, height: 320, title: 'Habilidades' },
    log: { x: 940, y: 636, width: 520, height: 320, title: 'Registro de Batallas' },
    navHintY: 680,
  } as const;

  private statPanel!: Panel;
  private weaponPanel!: Panel;
  private skillPanel!: Panel;
  private battleLogPanel!: Panel;
  private appearanceContainer?: Phaser.GameObjects.Container;
  private appearanceSprite?: Phaser.GameObjects.Sprite;
  private weaponRack?: WeaponRack;
  private skillGrid?: SkillGrid;
  private battleHistoryPanel?: BattleHistoryPanel;
  private currentFrame!: FrameInfo;
  private weaponSlots: WeaponSlot[] = [];
  private skillCells: SkillCell[] = [];
  private battleHistory: IBattleLog[] = [];
  private statsDisplay?: StatsPanelDisplay;
  private readonly statsCalculator = new StatsCalculator();
  private brutoRepo?: BrutoRepository;
  private brutoPetRepo?: BrutoPetRepository;
  private levelUpHistoryRepo?: LevelUpHistoryRepository;
  private currentBruto: IBruto | null = null;
  private unsubscribeSelectedBruto?: () => void;
  private isLoadingStats = false;
  private levelUpHistoryPanel?: LevelUpHistoryPanel;
  private levelUpHistoryEntries: LevelUpHistoryEntry[] = [];
  private xpBar?: XPBar;

  constructor() {
    super({ key: 'BrutoDetailsScene' });
  }

  create(): void {
    console.log('[BrutoDetailsScene] Scene created');

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(COLORS.background);

    this.currentFrame = this.calculateResponsiveFrame(width, height);
    this.skillCells = this.fetchSkillCells();

    this.renderHeader(width, this.currentFrame);
    this.renderXPBar(width, this.currentFrame);
    this.buildLayoutGrid(width, height, this.currentFrame);
    this.loadWeaponData();
    this.setupSelectedBrutoSubscription();
    void this.hydrateStatPanel();
    void this.loadLevelUpHistory();
    void this.loadBattleHistory();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeSelectedBruto?.();
      this.unsubscribeSelectedBruto = undefined;
      this.statsDisplay?.destroy();
      this.statsDisplay = undefined;
      this.levelUpHistoryPanel?.destroy();
      this.levelUpHistoryPanel = undefined;
      this.levelUpHistoryEntries = [];
      this.xpBar?.destroy();
      this.xpBar = undefined;
      this.battleHistoryPanel?.destroy();
      this.battleHistoryPanel = undefined;
    });
  }

  private renderHeader(width: number, frame: FrameInfo): void {
    const centerX = frame.offsetX + (BrutoDetailsScene.DESIGN_WIDTH * frame.scale) / 2;
    const headerTop = frame.offsetY + 60 * frame.scale;
    const titleSize = Math.max(TYPOGRAPHY.fontSize['2xl'] * frame.scale, 24);
    const subtitleSize = Math.max(TYPOGRAPHY.fontSize.base * frame.scale, 14);

    this.add
      .text(centerX, headerTop, 'Casillero', {
        fontSize: `${titleSize}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        headerTop + 46 * frame.scale,
        'Gestiona a tu bruto, armas, habilidades y combates recientes',
        {
          fontSize: `${subtitleSize}px`,
          color: COLORS.textSecondary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          fontStyle: 'italic',
        }
      )
      .setOrigin(0.5);

    const buttonOffsetX = 160 * frame.scale;
    const buttonY = headerTop;
    const buttonWidth = 160;
    const buttonHeight = 48;

    const backButton = new Button(this, {
      x: frame.offsetX + buttonOffsetX,
      y: buttonY,
      text: 'Volver',
      width: buttonWidth,
      height: buttonHeight,
      style: 'secondary',
      onClick: () => {
        this.scene.start('BrutoSelectionScene');
      },
    });
    backButton.setScale(Math.max(frame.scale, 0.9));

    const settingsButton = new Button(this, {
      x: width - frame.offsetX - buttonOffsetX,
      y: buttonY,
      text: 'Config',
      width: buttonWidth,
      height: buttonHeight,
      style: 'secondary',
      onClick: () => {
        this.game.events.emit('toggle-settings-drawer');
      },
    });
    settingsButton.setScale(Math.max(frame.scale, 0.9));
  }

  private renderXPBar(width: number, frame: FrameInfo): void {
    // Clean up existing XP bar
    if (this.xpBar) {
      this.xpBar.destroy();
      this.xpBar = undefined;
    }

    const selectedBruto = useStore.getState().selectedBruto;
    if (!selectedBruto) {
      return;
    }

    const centerX = frame.offsetX + (BrutoDetailsScene.DESIGN_WIDTH * frame.scale) / 2;
    const xpBarY = frame.offsetY + 140 * frame.scale;
    const barWidth = Math.min(500 * frame.scale, width * 0.4);
    const barHeight = 28 * frame.scale;

    this.xpBar = new XPBar(this, {
      x: centerX - barWidth / 2,
      y: xpBarY,
      width: barWidth,
      height: barHeight,
      currentXP: selectedBruto.xp || 0,
      currentLevel: selectedBruto.level || 1,
      showText: true,
      barColor: 0x4488ff,
      bgColor: 0x222222,
      borderColor: 0x666666,
    });

    this.xpBar.setDepth(100);
  }

  private buildLayoutGrid(width: number, height: number, frame: FrameInfo): void {
    const { scale, offsetX, offsetY, stackedLayout } = frame;

    this.createAppearanceDisplay(scale, offsetX, offsetY, stackedLayout, height);

    if (stackedLayout) {
      this.buildStackedLayout(height, scale, offsetX, offsetY);
      this.renderWeaponRack(scale);
      this.renderSkillGrid(scale);
      this.renderBattleLog(scale);
      return;
    }

    this.statPanel = this.buildPanel(BrutoDetailsScene.PANEL_LAYOUT.stats, scale, offsetX, offsetY);
    this.weaponPanel = this.buildPanel(BrutoDetailsScene.PANEL_LAYOUT.weapons, scale, offsetX, offsetY);
    this.skillPanel = this.buildPanel(BrutoDetailsScene.PANEL_LAYOUT.skills, scale, offsetX, offsetY);
    this.battleLogPanel = this.buildPanel(BrutoDetailsScene.PANEL_LAYOUT.log, scale, offsetX, offsetY);

    this.renderWeaponRack(scale);
    this.renderSkillGrid(scale);
    this.renderBattleLog(scale);

    const navHintY = offsetY + BrutoDetailsScene.PANEL_LAYOUT.navHintY * scale + 24 * scale;
    this.add
      .text(width / 2, navHintY, 'Usa los botones de navegacion para volver o desafiar oponentes', {
        fontSize: `${Math.max(TYPOGRAPHY.fontSize.sm * scale, 12)}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      })
      .setOrigin(0.5);
  }

  private setupSelectedBrutoSubscription(): void {
    this.unsubscribeSelectedBruto?.();

    let previousId: string | null = useStore.getState().selectedBruto?.id ?? null;

    this.unsubscribeSelectedBruto = useStore.subscribe((state) => {
      const currentId = state.selectedBruto?.id ?? null;

      if (currentId === previousId) {
        return;
      }

      previousId = currentId;

      if (!currentId) {
        this.statsDisplay?.showStatus(
          'Selecciona un bruto en el casillero para ver stats.',
          'info'
        );
        return;
      }

      void this.hydrateStatPanel();
      void this.loadLevelUpHistory();
      void this.loadBattleHistory();

      // Update XP Bar when bruto changes
      const { width } = this.cameras.main;
      this.renderXPBar(width, this.currentFrame);
    });
  }

  private buildPanel(
    config: { x: number; y: number; width: number; height: number; title: string },
    scale: number,
    offsetX: number,
    offsetY: number
  ): Panel {
    const scaledConfig = {
      x: offsetX + config.x * scale,
      y: offsetY + config.y * scale,
      width: config.width * scale,
      height: config.height * scale,
      title: config.title,
      backgroundColor: COLORS.surface,
      borderColor: COLORS.border,
      borderWidth: 2 * scale,
    };

    return new Panel(this, scaledConfig);
  }

  private buildStackedLayout(
    height: number,
    scale: number,
    offsetX: number,
    offsetY: number
  ): void {
    const STACK_ORDER = [
      BrutoDetailsScene.PANEL_LAYOUT.stats,
      BrutoDetailsScene.PANEL_LAYOUT.weapons,
      BrutoDetailsScene.PANEL_LAYOUT.skills,
      BrutoDetailsScene.PANEL_LAYOUT.log,
    ];

    const stackedWidth = Math.min(720, BrutoDetailsScene.PANEL_LAYOUT.stats.width) * scale;
    const baseX = offsetX + BrutoDetailsScene.DESIGN_WIDTH * scale * 0.5;

    let currentY = offsetY + 260 * scale;

    STACK_ORDER.forEach((panelConfig) => {
      const panel = new Panel(this, {
        x: baseX,
        y: currentY,
        width: stackedWidth,
        height: panelConfig.height * scale,
        title: panelConfig.title,
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 2 * scale,
      });

      currentY += panelConfig.height * scale + 28 * scale;

      if (panelConfig === BrutoDetailsScene.PANEL_LAYOUT.stats) {
        this.statPanel = panel;
      } else if (panelConfig === BrutoDetailsScene.PANEL_LAYOUT.weapons) {
        this.weaponPanel = panel;
      } else if (panelConfig === BrutoDetailsScene.PANEL_LAYOUT.skills) {
        this.skillPanel = panel;
      } else {
        this.battleLogPanel = panel;
      }
    });

    this.add
      .text(
        baseX,
        Math.min(currentY + 32 * scale, height - 48),
        'Usa los botones de navegacion para volver o desafiar oponentes',
        {
          fontSize: `${Math.max(TYPOGRAPHY.fontSize.sm * scale, 12)}px`,
          color: COLORS.textSecondary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          align: 'center',
        }
      )
      .setOrigin(0.5);

    this.renderWeaponRack(scale);
    this.renderSkillGrid(scale);
    this.renderBattleLog(scale);
  }

  private async hydrateStatPanel(): Promise<void> {
    if (!this.statPanel) {
      return;
    }

    if (!this.statsDisplay) {
      this.statsDisplay = new StatsPanelDisplay(this, this.statPanel);
    }

    const store = useStore.getState();
    const selected = store.selectedBruto;

    if (!selected) {
      this.currentBruto = null;
      this.statsDisplay.showStatus('Selecciona un bruto en el casillero para ver stats.', 'info');
      this.syncLevelUpHistoryPanelState();
      return;
    }

    if (this.isLoadingStats) {
      return;
    }

    this.isLoadingStats = true;
    this.statsDisplay.showLoading();

    try {
      if (!this.brutoRepo) {
        this.brutoRepo = new BrutoRepository(DatabaseManager.getInstance());
      }

      const result = await this.brutoRepo.findById(selected.id);

      if (!result.success) {
        console.warn('[BrutoDetailsScene] Failed to load bruto stats', result.error);
        this.statsDisplay.showStatus('No se pudieron cargar las estadisticas.', 'error');
        this.currentBruto = null;
        this.syncLevelUpHistoryPanelState();
        this.isLoadingStats = false;
        return;
      }

      if (!result.data) {
        console.warn('[BrutoDetailsScene] Bruto stats not found for id', selected.id);
        this.statsDisplay.showStatus('No encontramos datos del bruto seleccionado.', 'error');
        this.currentBruto = null;
        this.syncLevelUpHistoryPanelState();
        this.isLoadingStats = false;
        return;
      }

      this.currentBruto = result.data;
      const summary = this.statsCalculator.buildSummary(result.data);
      const modifiers = await this.buildModifierSummary(result.data);
      this.statsDisplay.update(summary, modifiers);
      this.syncLevelUpHistoryPanelState();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[BrutoDetailsScene] Unexpected error loading stats:', message);
      this.statsDisplay.showStatus('Error al cargar las estadisticas del bruto.', 'error');
      this.currentBruto = null;
      this.syncLevelUpHistoryPanelState();
    } finally {
      this.isLoadingStats = false;
    }
  }

  private async buildModifierSummary(bruto: IBruto): Promise<ModifierSummary> {
    const augmenters = mapAugmenterSkills(bruto.skills ?? []);
    let pets: PetChipData[] = [];

    try {
      if (!this.brutoPetRepo) {
        this.brutoPetRepo = new BrutoPetRepository(DatabaseManager.getInstance());
      }

      const petResult = await this.brutoPetRepo.findWithResistanceCost(bruto.id);
      if (petResult.success) {
        pets = mapPetRecords(petResult.data);
      } else {
        console.warn('[BrutoDetailsScene] Could not load pets for bruto', petResult.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[BrutoDetailsScene] Unexpected error loading pets:', message);
    }

    return { augmenters, pets };
  }

  private async loadLevelUpHistory(): Promise<void> {
    const selected = useStore.getState().selectedBruto;

    if (!selected) {
      this.levelUpHistoryEntries = [];
      this.levelUpHistoryPanel?.setLoading('Selecciona un bruto en el casillero para ver historial.');
      return;
    }

    this.levelUpHistoryPanel?.setLoading();

    try {
      if (!this.levelUpHistoryRepo) {
        this.levelUpHistoryRepo = new LevelUpHistoryRepository(DatabaseManager.getInstance());
      }

      const result = await this.levelUpHistoryRepo.findByBrutoId(selected.id);
      if (!result.success) {
        console.warn('[BrutoDetailsScene] Failed to load level up history', result.error);
        this.levelUpHistoryEntries = [];
        this.levelUpHistoryPanel?.setLoading('Error al cargar historial de nivel.');
        return;
      }

      this.levelUpHistoryEntries = this.mapLevelHistoryChoices(result.data);
      this.syncLevelUpHistoryPanelState();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[BrutoDetailsScene] Unexpected error loading level up history:', message);
      this.levelUpHistoryEntries = [];
      this.levelUpHistoryPanel?.setLoading('Error al cargar historial de nivel.');
    }
  }

  private syncLevelUpHistoryPanelState(): void {
    if (!this.levelUpHistoryPanel) {
      return;
    }

    const selected = this.currentBruto ?? useStore.getState().selectedBruto ?? null;
    if (!selected) {
      this.levelUpHistoryPanel.setLoading('Selecciona un bruto en el casillero para ver historial.');
      return;
    }

    this.levelUpHistoryPanel.setEntries(this.levelUpHistoryEntries);
  }

  private mapLevelHistoryChoices(choices: LevelUpChoice[]): LevelUpHistoryEntry[] {
    return choices.map((choice) => ({
      id: choice.id,
      level: choice.level,
      optionA: choice.optionA,
      optionB: choice.optionB,
      chosenOption: choice.chosenOption,
      chosenAt: choice.chosenAt,
    }));
  }

  private renderWeaponRack(scale: number): void {
    if (!this.weaponPanel) {
      return;
    }

    if (this.weaponRack) {
      this.weaponRack.destroy();
      this.weaponRack = undefined;
    }

    const panelBounds = this.weaponPanel.getBounds();
    const slots = this.resolveWeaponSlots();

    this.weaponRack = new WeaponRack(this, {
      x: panelBounds.centerX,
      y: panelBounds.centerY,
      width: panelBounds.width * 0.9,
      height: panelBounds.height * 0.75,
      slots,
      tooltip: (slot) => this.getWeaponTooltip(slot),
    });

    this.weaponRack.setDepth((this.weaponPanel.depth ?? 0) + 1);
  }

  private renderSkillGrid(scale: number): void {
    if (!this.skillPanel) {
      return;
    }

    if (this.skillGrid) {
      this.skillGrid.destroy();
      this.skillGrid = undefined;
    }

    const panelBounds = this.skillPanel.getBounds();
    const cells = this.resolveSkillCells();

    const availableHeight = panelBounds.height * 0.88;
    const availableWidth = panelBounds.width * 0.9;
    const spacing = SPACING.md * scale;
    const baseTop = panelBounds.centerY - availableHeight / 2;
    const gridHeight = Math.max(availableHeight * 0.55, 160 * scale);
    const historyHeight = Math.max(availableHeight - gridHeight - spacing, 120 * scale);

    const gridCenterY = baseTop + gridHeight / 2;
    const historyCenterY = baseTop + gridHeight + spacing + historyHeight / 2;

    this.skillGrid = new SkillGrid(this, {
      x: panelBounds.centerX,
      y: gridCenterY,
      width: availableWidth,
      height: gridHeight,
      cells,
      tooltip: (cell) => this.getSkillTooltip(cell),
    });

    this.skillGrid.setDepth((this.skillPanel.depth ?? 0) + 1);

    if (this.levelUpHistoryPanel) {
      this.levelUpHistoryPanel.destroy();
      this.levelUpHistoryPanel = undefined;
    }

    this.levelUpHistoryPanel = new LevelUpHistoryPanel(this, {
      width: availableWidth,
      height: historyHeight,
    });
    this.levelUpHistoryPanel.setPosition(panelBounds.centerX, historyCenterY);
    this.levelUpHistoryPanel.setDepth((this.skillPanel.depth ?? 0) + 1);

    this.syncLevelUpHistoryPanelState();
  }

  private renderBattleLog(scale: number): void {
    if (!this.battleLogPanel) {
      return;
    }

    if (this.battleHistoryPanel) {
      this.battleHistoryPanel.destroy();
      this.battleHistoryPanel = undefined;
    }

    const panelBounds = this.battleLogPanel.getBounds();

    this.battleHistoryPanel = new BattleHistoryPanel(this, {
      x: panelBounds.x + 10,
      y: panelBounds.y + 50,
      width: panelBounds.width - 20,
      height: panelBounds.height - 60,
      battles: this.battleHistory,
      onReplayClick: (battleId: string) => this.handleReplayClick(battleId),
    });

    this.battleHistoryPanel.setDepth((this.battleLogPanel.depth ?? 0) + 1);
  }

  private handleReplayClick(battleId: string): void {
    console.log('[BrutoDetailsScene] Opening replay for battle:', battleId);
    this.scene.start('ReplayScene', { battleId });
  }

  private async loadBattleHistory(): Promise<void> {
    const selected = useStore.getState().selectedBruto;

    if (!selected) {
      this.battleHistory = [];
      this.renderBattleLog(this.currentFrame.scale);
      return;
    }

    try {
      const battles = await BattleLoggerService.getBattlesForBruto(selected.id, 8);
      this.battleHistory = battles;
      this.renderBattleLog(this.currentFrame.scale);

      console.log('[BrutoDetailsScene] Loaded battle history:', {
        brutoId: selected.id,
        battleCount: battles.length,
      });
    } catch (error) {
      console.error('[BrutoDetailsScene] Error loading battle history:', error);
      this.battleHistory = [];
      this.renderBattleLog(this.currentFrame.scale);
    }
  }

  private resolveWeaponSlots(): WeaponSlot[] {
    const totalSlots = 7;
    const slots: WeaponSlot[] = [...this.weaponSlots.slice(0, totalSlots)];

    while (slots.length < totalSlots) {
      slots.push({ id: `slot-${slots.length}` });
    }

    return slots;
  }

  private resolveSkillCells(): SkillCell[] {
    const totalSlots = 49;
    const cells: SkillCell[] = [...this.skillCells.slice(0, totalSlots)];

    while (cells.length < totalSlots) {
      cells.push({
        id: `skill-slot-${cells.length}`,
        state: 'empty',
      });
    }

    return cells;
  }

  private getWeaponTooltip(slot: WeaponSlot): string {
    if (slot.name) {
      const acquisition = slot.acquiredAtLevel
        ? `Nivel obtenido: ${slot.acquiredAtLevel}\n`
        : '';
      return `${slot.name}\n${acquisition}Consulta docs/habilidades-catalogo.md para estadisticas y efectos.`;
    }

    return 'Espacio libre.\nConsulta docs/habilidades-catalogo.md para planificar futuras armas.';
  }

  private getSkillTooltip(cell: SkillCell): string {
    if (cell.state === 'known' && cell.name) {
      return `${cell.name}\nConsulta docs/habilidades-catalogo.md para detalles de la habilidad.`;
    }

    return 'Espacio disponible.\nLas habilidades se documentan en docs/habilidades-catalogo.md.';
  }

  private loadWeaponData(): void {
    const { selectedBruto } = useStore.getState();
    if (!selectedBruto) {
      this.weaponSlots = [];
      this.renderWeaponRack(this.currentFrame.scale);
      return;
    }

    const db = DatabaseManager.getInstance();
    const result = db.query<{ weapon_id: string; acquired_at_level: number }>(
      `SELECT weapon_id, acquired_at_level
         FROM bruto_weapons
        WHERE bruto_id = ?
        ORDER BY acquired_at_level ASC`,
      [selectedBruto.id]
    );

    if (!result.success) {
      console.warn('[BrutoDetailsScene] Failed to load weapon data:', result.error);
      this.weaponSlots = [];
      this.renderWeaponRack(this.currentFrame.scale);
      return;
    }

    this.weaponSlots = result.data.map((row) => ({
      id: row.weapon_id,
      name: formatWeaponName(row.weapon_id),
      acquiredAtLevel: row.acquired_at_level,
    }));

    this.renderWeaponRack(this.currentFrame.scale);
  }

  private fetchSkillCells(): SkillCell[] {
    const { selectedBruto } = useStore.getState();
    const learnedSkills = selectedBruto?.skills ?? [];

    return learnedSkills.map((skillId, index) => ({
      id: skillId || `skill-${index}`,
      name: formatSkillName(skillId),
      state: 'known',
    }));
  }

  private createAppearanceDisplay(
    scale: number,
    offsetX: number,
    offsetY: number,
    stackedLayout: boolean,
    screenHeight: number
  ): void {
    const containerX = offsetX + (BrutoDetailsScene.DESIGN_WIDTH * scale) / 2;
    const containerY = offsetY + (stackedLayout ? 190 * scale : 210 * scale);

    this.appearanceContainer?.destroy();

    const container = this.add.container(containerX, containerY);
    container.setDepth(5);
    this.appearanceContainer = container;

    const pedestal = this.add.ellipse(
      0,
      150 * scale,
      220 * scale,
      32 * scale,
      parseInt(COLORS.border.replace('#', '0x')),
      0.6
    );
    pedestal.setStrokeStyle(2 * scale, parseInt(COLORS.primaryDark.replace('#', '0x')), 0.65);
    container.add(pedestal);

    const sprite = this.createAppearanceSprite(scale);
    sprite.setY(120 * scale);
    container.add(sprite);
    this.appearanceSprite = sprite;
    this.createIdleTween(sprite, scale);

    const glow = this.add.rectangle(
      0,
      sprite.y - sprite.displayHeight * 0.45,
      sprite.displayWidth * 0.9,
      sprite.displayHeight * 0.6,
      parseInt(COLORS.primaryLight.replace('#', '0x')),
      0.18
    );
    glow.setBlendMode(Phaser.BlendModes.SCREEN);
    container.addAt(glow, 0);

    const nameText = this.add.text(0, 200 * scale, this.resolveCurrentBrutoName(), {
      fontSize: `${Math.max(TYPOGRAPHY.fontSize.lg * scale, 16)}px`,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontStyle: 'bold',
    });
    nameText.setOrigin(0.5, 0);
    container.add(nameText);

    const variantText = this.add.text(
      0,
      nameText.y + Math.max(TYPOGRAPHY.fontSize.lg * scale, 16) + 6 * scale,
      this.resolveAppearanceLabel(),
      {
        fontSize: `${Math.max(TYPOGRAPHY.fontSize.sm * scale, 12)}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      }
    );
    variantText.setOrigin(0.5, 0);
    container.add(variantText);

    if (stackedLayout) {
      const hint = this.add.text(
        0,
        Math.min(variantText.y + 40 * scale, screenHeight - 64),
        'Desplaza para ver armas y habilidades',
        {
          fontSize: `${Math.max(TYPOGRAPHY.fontSize.sm * scale, 12)}px`,
          color: COLORS.textSecondary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          align: 'center',
        }
      );
      hint.setOrigin(0.5, 0);
      container.add(hint);
    }
  }

  private resolveCurrentBrutoName(): string {
    const { selectedBruto } = useStore.getState();
    return selectedBruto ? selectedBruto.name : 'Bruto sin seleccionar';
  }

  private resolveAppearanceLabel(): string {
    const { selectedBruto } = useStore.getState();
    if (!selectedBruto) {
      return 'Selecciona un bruto para mostrar su estilo';
    }

    const design = selectedBruto.appearanceId ?? 0;
    const variant = selectedBruto.colorVariant ?? 0;
    return `Diseno ${design + 1} - Variante ${variant + 1}`;
  }

  private createAppearanceSprite(scale: number): Phaser.GameObjects.Sprite {
    const { selectedBruto } = useStore.getState();
    const designId = selectedBruto?.appearanceId ?? 0;
    const variant = selectedBruto?.colorVariant ?? 0;

    const color = this.resolveAppearanceColor(designId, variant);
    const textureKey = this.ensureAppearanceTexture(designId, variant, color);

    const sprite = this.add.sprite(0, 0, textureKey);
    sprite.setOrigin(0.5, 1);
    sprite.setScale(Math.max(scale, 0.85));

    return sprite;
  }

  private resolveAppearanceColor(designId: number, variant: number): number {
    const colorSeed = (designId + 1) * 53 + (variant + 1) * 97;
    const hue = (colorSeed % 360) / 360;
    const rgb = Phaser.Display.Color.HSVToRGB(hue, 0.55, 0.95);
    return rgb.color;
  }

  private ensureAppearanceTexture(designId: number, variant: number, color: number): string {
    const textureKey = `bruto-display-${designId}-${variant}`;

    if (!this.textures.exists(textureKey)) {
      const gfx = this.make.graphics({});
      gfx.fillStyle(color, 1);
      gfx.fillRoundedRect(0, 0, 180, 220, 18);

      gfx.lineStyle(6, parseInt(COLORS.primaryDark.replace('#', '0x')), 0.6);
      gfx.strokeRoundedRect(0, 0, 180, 220, 18);

      gfx.lineStyle(3, parseInt(COLORS.primaryLight.replace('#', '0x')), 0.5);
      gfx.strokeRoundedRect(12, 18, 156, 188, 12);

      gfx.generateTexture(textureKey, 180, 220);
      gfx.destroy();
    }

    return textureKey;
  }

  private createIdleTween(sprite: Phaser.GameObjects.Sprite, scale: number): void {
    this.tweens.add({
      targets: sprite,
      y: sprite.y - 10 * scale,
      duration: 1600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private calculateResponsiveFrame(width: number, height: number): FrameInfo {
    const scale = Math.min(
      width / BrutoDetailsScene.DESIGN_WIDTH,
      height / BrutoDetailsScene.DESIGN_HEIGHT
    );

    const designPixelWidth = BrutoDetailsScene.DESIGN_WIDTH * scale;
    const designPixelHeight = BrutoDetailsScene.DESIGN_HEIGHT * scale;

    const offsetX = (width - designPixelWidth) / 2;
    const offsetY = (height - designPixelHeight) / 2;

    const stackedLayout = width < 1100 || scale < 0.8;

    return { scale, offsetX, offsetY, stackedLayout };
  }
}
