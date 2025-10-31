import Phaser from 'phaser';

export class LevelUpScene extends Phaser.Scene {
  constructor() {
    super('LevelUpScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(0, 0, width, height, 0x0f0a13, 0.95)
      .setOrigin(0);

    this.add
      .text(width / 2, height / 2, 'Level Up Scene (placeholder)', {
        fontSize: '32px',
        color: '#ffae42',
        fontFamily: 'Arial Black, sans-serif',
      })
      .setOrigin(0.5);

    this.time.delayedCall(1000, () => {
      if (this.scene.isActive('UIScene')) {
        this.scene.stop();
      } else {
        this.scene.start('UIScene');
      }
    });
  }
}
