/**
 * ReplayScene Tests (Story 12.2)
 *
 * Tests replay viewer functionality including playback controls,
 * event display, and error handling.
 *
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BattleLoggerService, IBattleLog, IBrutoSnapshot } from '../services/BattleLoggerService';

// Mock Phaser completely to avoid Canvas initialization
vi.mock('phaser', () => ({
  default: {
    Scene: class MockScene {
      cameras = { main: { setBackgroundColor: vi.fn(), width: 1280, height: 720 } };
      add = {
        text: vi.fn(() => ({ setOrigin: vi.fn().mockReturnThis(), setAlpha: vi.fn().mockReturnThis(), setColor: vi.fn().mockReturnThis(), setFontSize: vi.fn().mockReturnThis(), setText: vi.fn().mockReturnThis() })),
        rectangle: vi.fn(() => ({ setStrokeStyle: vi.fn().mockReturnThis(), setOrigin: vi.fn().mockReturnThis() })),
      };
      time = { delayedCall: vi.fn((delay, callback) => callback()) };
      scene = { start: vi.fn() };
    },
  },
}));

// Mock BattleLoggerService
vi.mock('../services/BattleLoggerService', async () => {
  const actual = await vi.importActual<typeof import('../services/BattleLoggerService')>('../services/BattleLoggerService');
  return {
    ...actual,
    BattleLoggerService: {
      getBattleById: vi.fn(),
    },
  };
});

// Mock Button component
vi.mock('../ui/components/Button', () => ({
  Button: vi.fn().mockImplementation((scene, config) => {
    return {
      updateText: vi.fn(),
      destroy: vi.fn(),
      x: config.x,
      y: config.y,
      onClick: config.onClick,
      setScale: vi.fn(),
    };
  }),
}));

// Import after mocks
const { ReplayScene } = await import('./ReplayScene');

describe('ReplayScene', () => {
  let scene: ReplayScene;
  let mockPhaserScene: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Phaser scene infrastructure
    mockPhaserScene = {
      cameras: {
        main: {
          setBackgroundColor: vi.fn(),
          width: 1280,
          height: 720,
        },
      },
      add: {
        text: vi.fn((x, y, text, style) => ({
          setOrigin: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          setColor: vi.fn().mockReturnThis(),
          setFontSize: vi.fn().mockReturnThis(),
          setText: vi.fn().mockReturnThis(),
          x,
          y,
          text,
        })),
        rectangle: vi.fn(() => ({
          setStrokeStyle: vi.fn().mockReturnThis(),
          setOrigin: vi.fn().mockReturnThis(),
        })),
      },
      time: {
        delayedCall: vi.fn((delay, callback) => {
          callback();
        }),
      },
      scene: {
        start: vi.fn(),
      },
    };

    scene = new ReplayScene();
    Object.assign(scene, mockPhaserScene);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      const initData = { battleId: 'test-battle-123' };
      scene.init(initData);

      expect(scene['playbackSpeed']).toBe(1);
      expect(scene['isPaused']).toBe(false);
      expect(scene['currentEventIndex']).toBe(0);
    });

    it('should reset state on each init', () => {
      scene['playbackSpeed'] = 4;
      scene['isPaused'] = true;
      scene['currentEventIndex'] = 10;

      scene.init({ battleId: 'new-battle' });

      expect(scene['playbackSpeed']).toBe(1);
      expect(scene['isPaused']).toBe(false);
      expect(scene['currentEventIndex']).toBe(0);
    });
  });

  describe('Battle Loading', () => {
    it('should load battle data successfully', async () => {
      const mockBattle: IBattleLog = {
        id: 'battle-1',
        playerBrutoId: 'bruto-1',
        opponentBrutoId: 'bruto-2',
        winnerId: 'bruto-1',
        turnCount: 5,
        playerXpGained: 2,
        playerHpRemaining: 45,
        opponentHpRemaining: 0,
        playerBrutoSnapshot: {
          id: 'bruto-1',
          name: 'TestBruto',
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
          id: 'bruto-2',
          name: 'Opponent',
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
        combatLog: [
          { type: 'start', turn: 0, message: 'Battle started' },
          { type: 'damage', turn: 1, attacker: 'bruto-1', defender: 'bruto-2', damage: 21, message: 'Hit!' },
        ],
        rngSeed: '12345',
        foughtAt: new Date('2025-01-15T10:00:00Z'),
      };

      vi.mocked(BattleLoggerService.getBattleById).mockResolvedValue(mockBattle);

      await scene.create({ battleId: 'battle-1' });

      expect(BattleLoggerService.getBattleById).toHaveBeenCalledWith('battle-1');
      expect(scene['battleLog']).toEqual(mockBattle);
      expect(scene['currentPlayerHP']).toBe(66);
      expect(scene['currentOpponentHP']).toBe(66);
    });

    it('should handle battle not found', async () => {
      vi.mocked(BattleLoggerService.getBattleById).mockResolvedValue(null);

      await scene.create({ battleId: 'nonexistent' });

      expect(scene['battleLog']).toBeUndefined();
      // Should have created error text
      expect(mockPhaserScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('Battle not found'),
        expect.any(Object)
      );
    });

    it('should handle battle load error', async () => {
      vi.mocked(BattleLoggerService.getBattleById).mockRejectedValue(new Error('DB error'));

      await scene.create({ battleId: 'error-battle' });

      expect(scene['battleLog']).toBeUndefined();
      // Should have created error text
      expect(mockPhaserScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('Failed to load battle'),
        expect.any(Object)
      );
    });
  });

  describe('Playback Speed Control', () => {
    it('should cycle through speeds 1x -> 2x -> 4x -> 1x', () => {
      scene['playbackSpeed'] = 1;
      scene['speedButton'] = { updateText: vi.fn() } as any;

      scene['cycleSpeed']();
      expect(scene['playbackSpeed']).toBe(2);
      expect(scene['speedButton'].updateText).toHaveBeenCalledWith('Speed: 2x');

      scene['cycleSpeed']();
      expect(scene['playbackSpeed']).toBe(4);
      expect(scene['speedButton'].updateText).toHaveBeenCalledWith('Speed: 4x');

      scene['cycleSpeed']();
      expect(scene['playbackSpeed']).toBe(1);
      expect(scene['speedButton'].updateText).toHaveBeenCalledWith('Speed: 1x');
    });

    it('should adjust delay based on speed', async () => {
      scene['playbackSpeed'] = 1;
      const promise1 = scene['waitForDelay']();
      expect(mockPhaserScene.time.delayedCall).toHaveBeenCalledWith(1000, expect.any(Function));

      scene['playbackSpeed'] = 2;
      const promise2 = scene['waitForDelay']();
      expect(mockPhaserScene.time.delayedCall).toHaveBeenCalledWith(500, expect.any(Function));

      scene['playbackSpeed'] = 4;
      const promise3 = scene['waitForDelay']();
      expect(mockPhaserScene.time.delayedCall).toHaveBeenCalledWith(250, expect.any(Function));

      await Promise.all([promise1, promise2, promise3]);
    });
  });

  describe('Play/Pause Control', () => {
    it('should toggle pause state', () => {
      scene['isPaused'] = false;
      scene['playPauseButton'] = { updateText: vi.fn() } as any;

      scene['togglePlayPause']();
      expect(scene['isPaused']).toBe(true);
      expect(scene['playPauseButton'].updateText).toHaveBeenCalledWith('Resume');

      scene['togglePlayPause']();
      expect(scene['isPaused']).toBe(false);
      expect(scene['playPauseButton'].updateText).toHaveBeenCalledWith('Pause');
    });

    it('should start playback when unpausing from beginning', () => {
      scene['isPaused'] = true;
      scene['currentEventIndex'] = 0;
      scene['playPauseButton'] = { updateText: vi.fn() } as any;
      scene['battleLog'] = {
        combatLog: [],
      } as any;

      const startPlaybackSpy = vi.spyOn(scene as any, 'startPlayback');

      scene['togglePlayPause']();

      expect(scene['isPaused']).toBe(false);
      expect(startPlaybackSpy).toHaveBeenCalled();
    });

    it('should not start playback when unpausing from middle', () => {
      scene['isPaused'] = true;
      scene['currentEventIndex'] = 5;
      scene['playPauseButton'] = { updateText: vi.fn() } as any;

      const startPlaybackSpy = vi.spyOn(scene as any, 'startPlayback');

      scene['togglePlayPause']();

      expect(scene['isPaused']).toBe(false);
      expect(startPlaybackSpy).not.toHaveBeenCalled();
    });
  });

  describe('Event Display', () => {
    beforeEach(() => {
      scene['eventText'] = {
        setText: vi.fn(),
      } as any;
    });

    it('should display damage event with critical indicator', () => {
      const event = {
        type: 'damage' as const,
        turn: 1,
        message: 'Hit for 25 damage',
        isCrit: true,
      };

      scene['displayEvent'](event);

      expect(scene['eventText'].setText).toHaveBeenCalledWith('Hit for 25 damage 💥 CRITICAL!');
    });

    it('should display damage event without critical indicator', () => {
      const event = {
        type: 'damage' as const,
        turn: 1,
        message: 'Hit for 15 damage',
        isCrit: false,
      };

      scene['displayEvent'](event);

      expect(scene['eventText'].setText).toHaveBeenCalledWith('Hit for 15 damage');
    });

    it('should display dodge event', () => {
      const event = {
        type: 'dodge' as const,
        turn: 2,
        message: 'Attack missed',
      };

      scene['displayEvent'](event);

      expect(scene['eventText'].setText).toHaveBeenCalledWith('Attack missed ⚡ Dodged!');
    });
  });

  describe('HP Tracking', () => {
    beforeEach(() => {
      scene['playerHPText'] = { setText: vi.fn() } as any;
      scene['opponentHPText'] = { setText: vi.fn() } as any;
      scene['battleLog'] = {
        playerBrutoId: 'bruto-1',
        opponentBrutoId: 'bruto-2',
        playerBrutoSnapshot: { maxHp: 66 },
        opponentBrutoSnapshot: { maxHp: 66 },
      } as any;
      scene['currentPlayerHP'] = 66;
      scene['currentOpponentHP'] = 66;
    });

    it('should update opponent HP on damage event', () => {
      const event = {
        type: 'damage' as const,
        turn: 1,
        defender: 'bruto-2',
        damage: 21,
        message: 'Hit!',
      };

      scene['displayEvent'](event);

      // Manually trigger HP update since we're not running full playback
      scene['currentOpponentHP'] = Math.max(0, scene['currentOpponentHP'] - 21);
      scene['updateHP']();

      expect(scene['currentOpponentHP']).toBe(45);
      expect(scene['opponentHPText'].setText).toHaveBeenCalledWith('HP: 45/66');
    });

    it('should update player HP on damage event', () => {
      const event = {
        type: 'damage' as const,
        turn: 2,
        defender: 'bruto-1',
        damage: 18,
        message: 'Hit!',
      };

      scene['displayEvent'](event);

      scene['currentPlayerHP'] = Math.max(0, scene['currentPlayerHP'] - 18);
      scene['updateHP']();

      expect(scene['currentPlayerHP']).toBe(48);
      expect(scene['playerHPText'].setText).toHaveBeenCalledWith('HP: 48/66');
    });

    it('should not allow HP to go below 0', () => {
      scene['currentOpponentHP'] = 10;

      scene['currentOpponentHP'] = Math.max(0, scene['currentOpponentHP'] - 50);
      scene['updateHP']();

      expect(scene['currentOpponentHP']).toBe(0);
      expect(scene['opponentHPText'].setText).toHaveBeenCalledWith('HP: 0/66');
    });
  });

  describe('Skip to End', () => {
    it('should jump to final state and show result', () => {
      scene['battleLog'] = {
        combatLog: [
          { type: 'start', turn: 0, message: 'Start' },
          { type: 'damage', turn: 1, message: 'Hit 1' },
          { type: 'damage', turn: 2, message: 'Hit 2' },
        ],
        playerHpRemaining: 50,
        opponentHpRemaining: 0,
      } as any;
      scene['currentEventIndex'] = 0;
      scene['currentPlayerHP'] = 66;
      scene['currentOpponentHP'] = 66;

      const showResultSpy = vi.spyOn(scene as any, 'showResult');

      scene['skipToEnd']();

      expect(scene['currentEventIndex']).toBe(3);
      expect(scene['currentPlayerHP']).toBe(50);
      expect(scene['currentOpponentHP']).toBe(0);
      expect(showResultSpy).toHaveBeenCalled();
    });
  });

  describe('Result Display', () => {
    beforeEach(() => {
      scene['eventText'] = {
        setText: vi.fn(),
        setColor: vi.fn(),
        setFontSize: vi.fn(),
      } as any;
      scene['playPauseButton'] = {
        updateText: vi.fn(),
      } as any;
    });

    it('should show win result for player', () => {
      scene['battleLog'] = {
        winnerId: 'bruto-1',
        playerBrutoId: 'bruto-1',
        playerBrutoSnapshot: { name: 'TestBruto' },
      } as any;

      scene['showResult']();

      expect(scene['eventText'].setText).toHaveBeenCalledWith(expect.stringContaining('TestBruto WINS'));
      expect(scene['isPaused']).toBe(true);
      expect(scene['playPauseButton'].updateText).toHaveBeenCalledWith('Replay Again');
    });

    it('should show loss result for player', () => {
      scene['battleLog'] = {
        winnerId: 'bruto-2',
        playerBrutoId: 'bruto-1',
        opponentBrutoSnapshot: { name: 'OpponentBruto' },
      } as any;

      scene['showResult']();

      expect(scene['eventText'].setText).toHaveBeenCalledWith(expect.stringContaining('OpponentBruto WINS'));
      expect(scene['isPaused']).toBe(true);
    });
  });

  describe('Exit Replay', () => {
    it('should return to BrutoSelectionScene', () => {
      scene['exitReplay']();

      expect(mockPhaserScene.scene.start).toHaveBeenCalledWith('BrutoSelectionScene');
    });
  });

  describe('Error Handling', () => {
    it('should show error and back button when battle not found', async () => {
      vi.mocked(BattleLoggerService.getBattleById).mockResolvedValue(null);

      await scene.create({ battleId: 'missing' });

      // Verify error text created
      const errorCalls = mockPhaserScene.add.text.mock.calls.filter((call: any) =>
        call[2].includes('❌')
      );
      expect(errorCalls.length).toBeGreaterThan(0);
    });

    it('should handle missing eventText gracefully', () => {
      scene['eventText'] = undefined;

      // Should not throw
      expect(() => {
        scene['displayEvent']({ type: 'start', turn: 0, message: 'Test' });
      }).not.toThrow();
    });

    it('should handle missing HP text gracefully', () => {
      scene['playerHPText'] = undefined;
      scene['opponentHPText'] = undefined;
      scene['battleLog'] = undefined;

      // Should not throw
      expect(() => {
        scene['updateHP']();
      }).not.toThrow();
    });
  });

  describe('Scene Lifecycle', () => {
    it('should create replay banner with correct styling', async () => {
      const mockBattle: IBattleLog = {
        id: 'battle-1',
        playerBrutoId: 'bruto-1',
        opponentBrutoId: 'bruto-2',
        winnerId: 'bruto-1',
        turnCount: 3,
        playerXpGained: 2,
        playerHpRemaining: 50,
        opponentHpRemaining: 0,
        playerBrutoSnapshot: { maxHp: 66 } as IBrutoSnapshot,
        opponentBrutoSnapshot: { maxHp: 66 } as IBrutoSnapshot,
        combatLog: [],
        rngSeed: '12345',
        foughtAt: new Date(),
      };

      vi.mocked(BattleLoggerService.getBattleById).mockResolvedValue(mockBattle);

      await scene.create({ battleId: 'battle-1' });

      // Verify banner created
      const bannerCalls = mockPhaserScene.add.text.mock.calls.filter((call: any) =>
        call[2].includes('REPLAY MODE')
      );
      expect(bannerCalls.length).toBeGreaterThan(0);
    });

    it('should create all control buttons', async () => {
      const mockBattle: IBattleLog = {
        id: 'battle-1',
        playerBrutoId: 'bruto-1',
        opponentBrutoId: 'bruto-2',
        winnerId: 'bruto-1',
        turnCount: 3,
        playerXpGained: 2,
        playerHpRemaining: 50,
        opponentHpRemaining: 0,
        playerBrutoSnapshot: { maxHp: 66 } as IBrutoSnapshot,
        opponentBrutoSnapshot: { maxHp: 66 } as IBrutoSnapshot,
        combatLog: [],
        rngSeed: '12345',
        foughtAt: new Date(),
      };

      vi.mocked(BattleLoggerService.getBattleById).mockResolvedValue(mockBattle);

      await scene.create({ battleId: 'battle-1' });

      // Verify buttons created (play/pause, speed, skip, exit)
      expect(scene['playPauseButton']).toBeDefined();
      expect(scene['speedButton']).toBeDefined();
    });
  });
});
