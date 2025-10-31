/**
 * SettingsDrawer - User profile menu component
 * Modern profile menu with user options
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY } from '../../utils/theme';
import { Panel } from './Panel';
import { Button } from './Button';
import { useStore } from '../../state/store';

export class SettingsDrawer extends Phaser.GameObjects.Container {
  private panel: Panel;
  private closeButton: Button;
  private menuItems: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    const drawerWidth = 320;
    const drawerHeight = 400;
    const drawerX = 1280 - drawerWidth / 2 - 20;
    const drawerY = 300;

    // Panel
    this.panel = new Panel(scene, {
      x: drawerX,
      y: drawerY,
      width: drawerWidth,
      height: drawerHeight,
      title: 'Mi Perfil',
    });
    this.add(this.panel);

    // Close button
    this.closeButton = new Button(scene, {
      x: drawerX + drawerWidth / 2 - 40,
      y: drawerY - drawerHeight / 2 + 30,
      text: '×',
      onClick: () => {
        useStore.getState().toggleSettings();
        this.setVisible(false);
      },
      width: 40,
      height: 40,
      style: 'danger',
    });
    this.add(this.closeButton);

    // User info header
    const currentUser = useStore.getState().currentUser;
    const username = currentUser?.username || 'Usuario';
    
    const userInfo = scene.add.text(
      drawerX,
      drawerY - drawerHeight / 2 + 80,
      `👤 ${username}`,
      {
        fontSize: '18px',
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );
    userInfo.setOrigin(0.5);
    this.add(userInfo);

    // Divider
    const divider = scene.add.rectangle(
      drawerX,
      drawerY - drawerHeight / 2 + 110,
      drawerWidth - 60,
      2,
      parseInt(COLORS.border.replace('#', '0x'))
    );
    this.add(divider);

    // Menu items
    const startY = drawerY - drawerHeight / 2 + 150;
    const itemHeight = 50;

    // 👤 Mi perfil
    this.createMenuItem(scene, drawerX, startY, '👤', 'Mi perfil', () => {
      console.log('[Profile] Ver perfil');
      // TODO: Implementar vista de perfil
    });

    // 🔊 Sonido
    const audioEnabled = useStore.getState().audioEnabled;
    const soundItem = this.createMenuItem(
      scene, 
      drawerX, 
      startY + itemHeight, 
      '🔊', 
      audioEnabled ? 'Sonido: ON' : 'Sonido: OFF', 
      () => {
        useStore.getState().toggleAudio();
        const newState = useStore.getState().audioEnabled;
        soundItem.text.setText(newState ? 'Sonido: ON' : 'Sonido: OFF');
      }
    );

    // ⚙️ Preferencias
    this.createMenuItem(scene, drawerX, startY + itemHeight * 2, '⚙️', 'Preferencias', () => {
      console.log('[Profile] Preferencias');
      // TODO: Implementar preferencias
    });

    // 🚪 Cerrar sesión
    this.createMenuItem(scene, drawerX, startY + itemHeight * 3, '🚪', 'Cerrar sesión', () => {
      console.log('[Profile] Cerrar sesión');
      useStore.getState().logout();
      this.setVisible(false);
      scene.scene.start('LoginScene');
    }, '#f44336');

    this.setDepth(999);
    this.setVisible(false);
    scene.add.existing(this);
  }

  private createMenuItem(
    scene: Phaser.Scene,
    x: number,
    y: number,
    icon: string,
    text: string,
    onClick: () => void,
    hoverColor: string = COLORS.primary
  ): { container: Phaser.GameObjects.Container; text: Phaser.GameObjects.Text } {
    const itemContainer = scene.add.container(x, y);

    // Background (invisible by default)
    const bg = scene.add.rectangle(0, 0, 280, 45, 0xffffff, 0);
    bg.setInteractive({ useHandCursor: true });
    itemContainer.add(bg);

    // Icon
    const iconText = scene.add.text(-120, 0, icon, {
      fontSize: '24px',
    });
    iconText.setOrigin(0, 0.5);
    itemContainer.add(iconText);

    // Text
    const itemText = scene.add.text(-80, 0, text, {
      fontSize: '16px',
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
    });
    itemText.setOrigin(0, 0.5);
    itemContainer.add(itemText);

    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(parseInt(hoverColor.replace('#', '0x')), 0.1);
      scene.tweens.add({
        targets: itemContainer,
        x: x + 5,
        duration: 150,
        ease: 'Power2',
      });
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0xffffff, 0);
      scene.tweens.add({
        targets: itemContainer,
        x: x,
        duration: 150,
        ease: 'Power2',
      });
    });

    bg.on('pointerdown', () => {
      scene.tweens.add({
        targets: itemContainer,
        scale: 0.98,
        duration: 100,
        yoyo: true,
        onComplete: onClick,
      });
    });

    this.add(itemContainer);
    this.menuItems.push(itemContainer);

    return { container: itemContainer, text: itemText };
  }

  public show(): void {
    this.setVisible(true);
  }

  public hide(): void {
    this.setVisible(false);
  }
}
