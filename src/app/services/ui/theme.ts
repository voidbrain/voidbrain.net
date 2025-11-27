import { Injectable, signal, inject, RendererFactory2, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Settings } from '../settings';

export type ThemeType = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private settings = inject(Settings);
  private isBrowser = false;

  private readonly DARK_CLASS = 'ion-theme-dark';
  private readonly THEME_ATTRIBUTE = 'data-theme';

  // Reactive theme state
  private currentTheme = signal<ThemeType>('light');

  constructor() {
    this.initializeTheme();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private initializeTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Get theme from settings service (which loads from settings localStorage)
      const settings = this.settings.getSettings();
      this.setTheme(settings.theme);
    } else {
      // Defaults for server-side rendering
      this.currentTheme.set('light');
    }
  }

  get currentThemeSignal() {
    return this.currentTheme.asReadonly();
  }

  get currentThemeValue(): ThemeType {
    return this.currentTheme();
  }

  setTheme(theme: ThemeType): void {
    this.currentTheme.set(theme);

    // Update document class and data attribute
    if (isPlatformBrowser(this.platformId)) {
      if (theme === 'dark') {
        this.renderer.addClass(this.document.documentElement, this.DARK_CLASS);
        this.renderer.removeAttribute(this.document.documentElement, this.THEME_ATTRIBUTE);
      } else {
        this.renderer.removeClass(this.document.documentElement, this.DARK_CLASS);
        this.renderer.setAttribute(this.document.documentElement, this.THEME_ATTRIBUTE, 'light');
      }
    }

    // Note: Theme preference is now saved by Settings service when user saves settings
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  isLight(): boolean {
    return this.currentTheme() === 'light';
  }
}
