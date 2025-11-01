/**
 * BattleHistoryPanel Tests (Story 12.2)
 *
 * Tests battle history list UI component including rendering,
 * interaction, and data display.
 *
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IBattleLog } from '../../services/BattleLoggerService';

// Mock Phaser completely
vi.mock('phaser', () => ({
  default: {
    GameObjects: {
      Container: class MockContainer {
        scene: any;
        x = 0;
        y = 0;
        add = vi.fn();
        removeAll = vi.fn();
        setDepth = vi.fn();
        destroy = vi.fn();
        constructor(scene: any, x: number, y: number) {
          this.scene = scene; // CRITICAL: Must set scene for child methods to work
          this.x = x;
          this.y = y;
        }
      },
    },
  },
}));

// Import after mock
const { BattleHistoryPanel } = await import('./BattleHistoryPanel');
type BattleHistoryPanelConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
  battles: IBattleLog[];
  onReplayClick: (battleId: string) => void;
};

// Mock Phaser scene
const mockScene = {
  add: {
    existing: vi.fn(),
    rectangle: vi.fn(() => {
      const onMock = vi.fn().mockReturnThis();
      return {
        setStrokeStyle: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: onMock,
        setFillStyle: vi.fn().mockReturnThis(),
      };
    }),
    text: vi.fn((x, y, text, style) => {
      const onMock = vi.fn().mockReturnThis();
      return {
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: onMock,
        setColor: vi.fn().mockReturnThis(),
        x,
        y,
        text,
        style,
      };
    }),
  },
};

describe('BattleHistoryPanel', () => {
  let panel: any;
  let onReplayClickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onReplayClickSpy = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockBattle = (id: string, isWin: boolean, opponentName: string, daysAgo: number = 0): IBattleLog => {
    const now = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    return {
      id,
      playerBrutoId: 'player-bruto-1',
      opponentBrutoId: 'opponent-bruto-1',
      winnerId: isWin ? 'player-bruto-1' : 'opponent-bruto-1',
      turnCount: 5,
      playerXpGained: 2,
      playerHpRemaining: isWin ? 45 : 0,
      opponentHpRemaining: isWin ? 0 : 45,
      playerBrutoSnapshot: {
        id: 'player-bruto-1',
        name: 'MyBruto',
        level: 3,
        hp: 66,
        maxHp: 66,
        str: 3,
        speed: 2,
        agility: 2,
        resistance: 1.67,
        appearanceId: 1,
        colorVariant: 1,
      },
      opponentBrutoSnapshot: {
        id: 'opponent-bruto-1',
        name: opponentName,
        level: 3,
        hp: 66,
        maxHp: 66,
        str: 3,
        speed: 2,
        agility: 2,
        resistance: 1.67,
        appearanceId: 2,
        colorVariant: 2,
      },
      combatLog: [],
      rngSeed: '12345',
      foughtAt: new Date(now),
    };
  };

  describe('Empty State', () => {
    it('should display empty state message when no battles', () => {
      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles: [],
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Verify empty state text was created
      const textCalls = mockScene.add.text.mock.calls;
      const emptyStateCall = textCalls.find((call: any) =>
        call[2].includes('No battles yet')
      );
      expect(emptyStateCall).toBeDefined();
    });

    it('should not create battle rows when empty', () => {
      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles: [],
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Should not have created any opponent name texts
      const textCalls = mockScene.add.text.mock.calls;
      const battleRowTexts = textCalls.filter((call: any) =>
        call[2].startsWith('vs ')
      );
      expect(battleRowTexts.length).toBe(0);
    });
  });

  describe('Battle List Rendering', () => {
    it('should render single battle correctly', () => {
      const battles = [createMockBattle('battle-1', true, 'Enemy1')];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Verify title created
      const titleCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2] === 'Battle History'
      );
      expect(titleCalls.length).toBeGreaterThan(0);

      // Verify opponent name created
      const opponentCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2] === 'vs Enemy1'
      );
      expect(opponentCalls.length).toBe(1);

      // Verify WIN text created
      const winCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2] === 'WIN'
      );
      expect(winCalls.length).toBe(1);
    });

    it('should display WIN for victories', () => {
      const battles = [createMockBattle('battle-1', true, 'Enemy1')];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      const winCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2] === 'WIN'
      );
      expect(winCalls.length).toBe(1);
    });

    it('should display LOSS for defeats', () => {
      const battles = [createMockBattle('battle-1', false, 'Enemy1')];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      const lossCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2] === 'LOSS'
      );
      expect(lossCalls.length).toBe(1);
    });

    it('should render up to 4 battles (MAX_VISIBLE)', () => {
      const battles = [
        createMockBattle('battle-1', true, 'Enemy1'),
        createMockBattle('battle-2', false, 'Enemy2'),
        createMockBattle('battle-3', true, 'Enemy3'),
        createMockBattle('battle-4', false, 'Enemy4'),
      ];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Should have 4 opponent texts
      const opponentCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2].startsWith('vs Enemy')
      );
      expect(opponentCalls.length).toBe(4);
    });

    it('should show "more battles" indicator when > 4 battles', () => {
      const battles = Array.from({ length: 8 }, (_, i) =>
        createMockBattle(`battle-${i + 1}`, i % 2 === 0, `Enemy${i + 1}`)
      );

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Should show "more battles" text
      const moreCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2].includes('more battles')
      );
      expect(moreCalls.length).toBeGreaterThan(0);
      expect(moreCalls[0][2]).toContain('+4 more battles');
    });

    it('should not show "more battles" indicator when <= 4 battles', () => {
      const battles = [
        createMockBattle('battle-1', true, 'Enemy1'),
        createMockBattle('battle-2', false, 'Enemy2'),
      ];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Should NOT show "more battles" text
      const moreCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2].includes('more battles')
      );
      expect(moreCalls.length).toBe(0);
    });
  });

  describe('Date Formatting', () => {
    it('should format battle date correctly', () => {
      const now = new Date();
      const battles = [{
        ...createMockBattle('battle-1', true, 'Enemy1'),
        foughtAt: now,
      }];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Verify date text was created (checking for date-like format)
      const dateCalls = mockScene.add.text.mock.calls.filter((call: any) => {
        const text = call[2];
        return typeof text === 'string' && (
          text.includes(':') || // Has time
          /\d/.test(text) // Has numbers
        ) && !text.includes('vs') && !text.includes('Battle') && text !== 'WIN' && text !== 'LOSS' && !text.includes('Replay');
      });
      expect(dateCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Click Handling', () => {
    it('should call onReplayClick with battle ID when row clicked', () => {
      const battles = [createMockBattle('battle-123', true, 'Enemy1')];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Find the row rectangle (second rectangle created, first is panel bg)
      const rectangles = mockScene.add.rectangle.mock.results;
      expect(rectangles.length).toBeGreaterThanOrEqual(2);
      
      const rowRectangle = rectangles[1]; // Index 1 is the first battle row

      expect(rowRectangle).toBeDefined();

      // Simulate getting the 'on' calls for this rectangle
      const rectMock = rowRectangle!.value;
      const onCalls = rectMock.on.mock.calls;

      // Find the pointerdown handler
      const pointerdownCall = onCalls.find((call: any) => call[0] === 'pointerdown');
      expect(pointerdownCall).toBeDefined();

      // Execute the click handler
      const clickHandler = pointerdownCall[1];
      clickHandler();

      expect(onReplayClickSpy).toHaveBeenCalledWith('battle-123');
    });

    it('should call onReplayClick when replay button clicked', () => {
      const battles = [createMockBattle('battle-456', true, 'Enemy1')];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Find the replay button text
      const textElements = mockScene.add.text.mock.results;
      const replayButton = textElements.find((result: any) => {
        return result.value.text === '▶ Replay';
      });

      expect(replayButton).toBeDefined();

      // Get the click handler
      const textMock = replayButton!.value;
      const onCalls = textMock.on.mock.calls;
      const pointerdownCall = onCalls.find((call: any) => call[0] === 'pointerdown');
      expect(pointerdownCall).toBeDefined();

      // Execute the click handler with mock event
      const clickHandler = pointerdownCall[1];
      const mockEvent = { stopPropagation: vi.fn() };
      clickHandler(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(onReplayClickSpy).toHaveBeenCalledWith('battle-456');
    });

    it('should not call onReplayClick if battle has no ID', () => {
      const battles = [{
        ...createMockBattle('', true, 'Enemy1'),
        id: undefined,
      }] as any[];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Try to find and click the row
      const rectangles = mockScene.add.rectangle.mock.results;
      const rowRectangle = rectangles.find((result: any) => {
        const rect = result.value;
        return rect.setInteractive && rect.on;
      });

      if (rowRectangle) {
        const rectMock = rowRectangle.value;
        const onCalls = rectMock.on.mock.calls;
        const pointerdownCall = onCalls.find((call: any) => call[0] === 'pointerdown');

        if (pointerdownCall) {
          const clickHandler = pointerdownCall[1];
          clickHandler();
        }
      }

      expect(onReplayClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Hover Effects', () => {
    it('should register hover handlers for battle rows', () => {
      const battles = [createMockBattle('battle-1', true, 'Enemy1')];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Find row rectangles (second rectangle created, first is panel bg)
      const rectangles = mockScene.add.rectangle.mock.results;
      expect(rectangles.length).toBeGreaterThanOrEqual(2);
      
      const rowRectangle = rectangles[1]; // Index 1 is the first battle row

      expect(rowRectangle).toBeDefined();

      const rectMock = rowRectangle!.value;
      const onCalls = rectMock.on.mock.calls;

      // Verify hover handlers registered
      const pointeroverCall = onCalls.find((call: any) => call[0] === 'pointerover');
      const pointeroutCall = onCalls.find((call: any) => call[0] === 'pointerout');

      expect(pointeroverCall).toBeDefined();
      expect(pointeroutCall).toBeDefined();
    });
  });

  describe('Update Functionality', () => {
    it('should update battles list when updateBattles called', () => {
      const initialBattles = [createMockBattle('battle-1', true, 'Enemy1')];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles: initialBattles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Clear mocks to track new calls
      vi.clearAllMocks();

      const newBattles = [
        createMockBattle('battle-2', false, 'Enemy2'),
        createMockBattle('battle-3', true, 'Enemy3'),
      ];

      panel.updateBattles(newBattles);

      // Verify new battles were rendered
      const opponentCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2].startsWith('vs Enemy')
      );
      expect(opponentCalls.length).toBeGreaterThan(0);
    });

    it('should show empty state after updating to empty list', () => {
      const initialBattles = [
        createMockBattle('battle-1', true, 'Enemy1'),
        createMockBattle('battle-2', false, 'Enemy2'),
      ];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles: initialBattles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Clear mocks
      vi.clearAllMocks();

      panel.updateBattles([]);

      // Verify empty state shown
      const emptyCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2].includes('No battles yet')
      );
      expect(emptyCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Layout and Positioning', () => {
    it('should respect configured position and dimensions', () => {
      const battles = [createMockBattle('battle-1', true, 'Enemy1')];

      const config: BattleHistoryPanelConfig = {
        x: 200,
        y: 150,
        width: 600,
        height: 400,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Verify background rectangle created with correct dimensions
      const bgCall = mockScene.add.rectangle.mock.calls[0];
      expect(bgCall[0]).toBe(0); // x relative to container
      expect(bgCall[1]).toBe(0); // y relative to container
      expect(bgCall[2]).toBe(600); // width
      expect(bgCall[3]).toBe(400); // height
    });

    it('should space battle rows correctly', () => {
      const battles = [
        createMockBattle('battle-1', true, 'Enemy1'),
        createMockBattle('battle-2', false, 'Enemy2'),
        createMockBattle('battle-3', true, 'Enemy3'),
      ];

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Find battle row rectangles (skip background)
      const rectangles = mockScene.add.rectangle.mock.calls.slice(1); // Skip first (background)

      // Verify rows are spaced by ROW_HEIGHT (60)
      expect(rectangles.length).toBeGreaterThan(0);
      // First row should be at startY (60)
      expect(rectangles[0][1]).toBe(60);
    });
  });

  describe('Edge Cases', () => {
    it('should handle exactly MAX_VISIBLE battles (4) without indicator', () => {
      const battles = Array.from({ length: 4 }, (_, i) =>
        createMockBattle(`battle-${i + 1}`, i % 2 === 0, `Enemy${i + 1}`)
      );

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Should NOT show "more battles" text
      const moreCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2].includes('more battles')
      );
      expect(moreCalls.length).toBe(0);
    });

    it('should handle maximum battles (8) correctly', () => {
      const battles = Array.from({ length: 8 }, (_, i) =>
        createMockBattle(`battle-${i + 1}`, i % 2 === 0, `Enemy${i + 1}`)
      );

      const config: BattleHistoryPanelConfig = {
        x: 100,
        y: 100,
        width: 500,
        height: 300,
        battles,
        onReplayClick: onReplayClickSpy,
      };

      panel = new BattleHistoryPanel(mockScene as any, config);

      // Should show first 4 battles
      const opponentCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2].startsWith('vs Enemy')
      );
      expect(opponentCalls.length).toBe(4);

      // Should show "+4 more battles"
      const moreCalls = mockScene.add.text.mock.calls.filter((call: any) =>
        call[2].includes('+4 more battles')
      );
      expect(moreCalls.length).toBeGreaterThan(0);
    });
  });
});
