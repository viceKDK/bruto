/**
 * Layout Utilities
 * Responsive layout helpers for various screen sizes
 */

export interface ViewportSize {
  width: number;
  height: number;
  scale: number;
  type: 'desktop' | 'tablet' | 'mobile';
}

export class LayoutManager {
  private static readonly DESIGN_WIDTH = 1280;
  private static readonly DESIGN_HEIGHT = 720;
  private static readonly DESIGN_RATIO = 16 / 9;

  /**
   * Calculate viewport properties based on current screen size
   */
  static getViewportSize(): ViewportSize {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = width / height;

    let scale = 1;
    let type: 'desktop' | 'tablet' | 'mobile' = 'desktop';

    // Determine device type
    if (width < 768) {
      type = 'mobile';
    } else if (width < 1024) {
      type = 'tablet';
    }

    // Calculate scale to fit content
    if (ratio > this.DESIGN_RATIO) {
      // Width is relatively larger - scale by height
      scale = height / this.DESIGN_HEIGHT;
    } else {
      // Height is relatively larger - scale by width
      scale = width / this.DESIGN_WIDTH;
    }

    // Clamp scale to reasonable values
    scale = Math.max(0.5, Math.min(2, scale));

    return {
      width,
      height,
      scale,
      type,
    };
  }

  /**
   * Calculate centered position for an element
   */
  static centerPosition(): { x: number; y: number } {
    return {
      x: this.DESIGN_WIDTH / 2,
      y: this.DESIGN_HEIGHT / 2,
    };
  }

  /**
   * Calculate position relative to viewport edges
   */
  static edgePosition(
    edge: 'top' | 'bottom' | 'left' | 'right',
    offset: number = 0
  ): { x: number; y: number } {
    switch (edge) {
      case 'top':
        return { x: this.DESIGN_WIDTH / 2, y: offset };
      case 'bottom':
        return { x: this.DESIGN_WIDTH / 2, y: this.DESIGN_HEIGHT - offset };
      case 'left':
        return { x: offset, y: this.DESIGN_HEIGHT / 2 };
      case 'right':
        return { x: this.DESIGN_WIDTH - offset, y: this.DESIGN_HEIGHT / 2 };
    }
  }

  /**
   * Calculate grid positions for a set of items
   */
  static gridPositions(
    count: number,
    columns: number,
    cellWidth: number,
    cellHeight: number,
    startX: number,
    startY: number,
    spacingX: number = 0,
    spacingY: number = 0
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < count; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);

      positions.push({
        x: startX + col * (cellWidth + spacingX),
        y: startY + row * (cellHeight + spacingY),
      });
    }

    return positions;
  }

  /**
   * Check if an element is within viewport bounds
   */
  static isInViewport(x: number, y: number, margin: number = 0): boolean {
    return (
      x >= margin &&
      x <= this.DESIGN_WIDTH - margin &&
      y >= margin &&
      y <= this.DESIGN_HEIGHT - margin
    );
  }
}
