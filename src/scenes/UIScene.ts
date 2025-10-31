/**
 * UIScene - Persistent UI overlay
 * Runs parallel to main scenes with settings drawer and user info
 */

import Phaser from 'phaser';
import { SettingsDrawer } from '../ui/components/SettingsDrawer';
import { useStore } from '../state/store';
import { secondsUntilNextUtcMidnight } from '../utils/dates';

export class UIScene extends Phaser.Scene {
  private settingsDrawer!: SettingsDrawer;
  private userInfoText!: Phaser.GameObjects.Text;
  private fightInfoText!: Phaser.GameObjects.Text;
  private profileBtn?: Phaser.GameObjects.Arc;
  private userIcon?: Phaser.GameObjects.Text;
  private usernameText?: Phaser.GameObjects.Text;
  private loginButton?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create(): void {
    console.log('[UIScene] Persistent overlay created');

    this.createTopRightButton();

    // Settings drawer
    this.settingsDrawer = new SettingsDrawer(this);

    // User info display (top-left corner)
    this.userInfoText = this.add.text(20, 20, '', {
      fontSize: '14px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
    });

    this.fightInfoText = this.add.text(20, 45, '', {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif',
    });

    // Update user info on each frame
    this.events.on('update', this.updateUserInfo, this);

    // Listen to store changes
    useStore.subscribe(() => {
      this.updateTopRightButton();
    });

    // Set UI overlay to always be on top
    this.scene.bringToTop();
  }

  private createTopRightButton(): void {
    const currentUser = useStore.getState().currentUser;

    if (currentUser) {
      // Show profile button with username
      this.createProfileButton(currentUser.username);
    } else {
      // Show LOGIN button
      this.createLoginButton();
    }
  }

  private createProfileButton(username: string): void {
    // Profile circle
    this.profileBtn = this.add.circle(1220, 40, 26, 0x2196F3, 1);
    this.profileBtn.setInteractive({ useHandCursor: true });
    this.profileBtn.setStrokeStyle(3, 0xffffff);
    
    // User icon (👤)
    this.userIcon = this.add.text(1220, 40, '👤', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Username text
    this.usernameText = this.add.text(1190, 40, username, {
      fontSize: '14px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(1, 0.5);

    // Hover effects
    this.profileBtn.on('pointerover', () => {
      this.profileBtn?.setFillStyle(0x1976D2);
      this.tweens.add({
        targets: [this.profileBtn, this.userIcon],
        scale: 1.1,
        duration: 200,
        ease: 'Back.easeOut',
      });
    });

    this.profileBtn.on('pointerout', () => {
      this.profileBtn?.setFillStyle(0x2196F3);
      this.tweens.add({
        targets: [this.profileBtn, this.userIcon],
        scale: 1,
        duration: 200,
        ease: 'Back.easeIn',
      });
    });

    this.profileBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: [this.profileBtn, this.userIcon],
        scale: 0.95,
        duration: 100,
        yoyo: true,
      });
      this.toggleSettingsDrawer();
    });
  }

  private createLoginButton(): void {
    const container = this.add.container(1150, 40);

    // Green button background - lighter green
    const bg = this.add.rectangle(0, 0, 120, 45, 0x4CAF50, 1);
    bg.setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(3, 0xffffff);
    
    // Add inner shadow effect with darker border
    const innerBorder = this.add.rectangle(0, 0, 118, 43, 0x000000, 0);
    innerBorder.setStrokeStyle(1, 0x388E3C, 0.3);
    container.add(innerBorder);
    container.add(bg);

    // "LOG IN" text - anti-aliased
    const text = this.add.text(0, 0, 'LOG IN', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    text.setStroke('#2E7D32', 2);
    text.setShadow(0, 2, '#2E7D32', 2, false, true);
    container.add(text);

    this.loginButton = container;

    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(0x66BB6A);
      this.tweens.add({
        targets: container,
        scale: 1.08,
        duration: 200,
        ease: 'Back.easeOut',
      });
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x4CAF50);
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 200,
        ease: 'Back.easeIn',
      });
    });

    bg.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.scene.start('LoginScene');
        },
      });
    });
  }

  private updateTopRightButton(): void {
    // Destroy existing elements
    this.profileBtn?.destroy();
    this.userIcon?.destroy();
    this.usernameText?.destroy();
    this.loginButton?.destroy();

    this.profileBtn = undefined;
    this.userIcon = undefined;
    this.usernameText = undefined;
    this.loginButton = undefined;

    // Recreate button based on login state
    this.createTopRightButton();
  }

  private updateUserInfo(): void {
    const { currentUser, selectedBruto, dailyFights } = useStore.getState();

    if (currentUser) {
      let text = `User: ${currentUser.username} | Coins: ${currentUser.coins}`;
      if (selectedBruto) {
        text += ` | Bruto: ${selectedBruto.name} (Lvl ${selectedBruto.level})`;
      }
      this.userInfoText.setText(text);

      const remaining = Math.max(0, dailyFights.remaining);
      const fightsLine = `Fights: ${remaining}/${dailyFights.maxFights} left`;
      const resetSeconds = secondsUntilNextUtcMidnight();
      const resetLine =
        resetSeconds > 0 ? `Resets in ${this.formatAsCountdown(resetSeconds)}` : '';
      this.fightInfoText.setText(resetLine ? `${fightsLine}\n${resetLine}` : fightsLine);
      this.fightInfoText.setVisible(true);
    } else {
      this.userInfoText.setText('');
      this.fightInfoText.setText('');
      this.fightInfoText.setVisible(false);
    }
  }

  private formatAsCountdown(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  }

  private toggleSettingsDrawer(): void {
    useStore.getState().toggleSettings();
    this.settingsDrawer.show();
  }
}
