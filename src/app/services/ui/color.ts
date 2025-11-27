import { Injectable, signal, inject, RendererFactory2, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Settings } from '../settings';

export type ColorType = 'purple' | 'orange' | 'green';

@Injectable({
  providedIn: 'root',
})
export class Color {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private settings = inject(Settings);
  private isBrowser = false;

  private readonly COLOR_CLASSES = {
    purple: 'color-purple',
    orange: 'color-orange',
    green: 'color-green',
  };

  // Reactive color state
  private currentColor = signal<ColorType>('purple');

  constructor() {
    this.initializeColor();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private initializeColor(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Get color from settings service (which loads from settings localStorage)
      const settings = this.settings.getSettings();
      this.setColor(settings.color);
    } else {
      // Defaults for server-side rendering
      this.currentColor.set('purple');
    }
  }

  get currentColorSignal() {
    return this.currentColor.asReadonly();
  }

  get currentColorValue(): ColorType {
    return this.currentColor();
  }

  setColor(color: ColorType): void {
    this.currentColor.set(color);

    // Update document classes
    if (isPlatformBrowser(this.platformId)) {
      // Remove all color classes first
      Object.values(this.COLOR_CLASSES).forEach(className => {
        this.renderer.removeClass(this.document.documentElement, className);
      });

      // Add the appropriate color class (skip purple as it's default)
      if (color !== 'purple') {
        this.renderer.addClass(this.document.documentElement, this.COLOR_CLASSES[color]);
      }
    }

    // Note: Color preference is now saved by Settings service when user saves settings
  }

  isPurple(): boolean {
    return this.currentColor() === 'purple';
  }

  isOrange(): boolean {
    return this.currentColor() === 'orange';
  }

  isGreen(): boolean {
    return this.currentColor() === 'green';
  }
}
