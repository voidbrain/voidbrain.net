import { Injectable, signal, inject, RendererFactory2, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type ThemeType = 'light' | 'dark';
export type StyleType = 'default' | 'liquid-glass';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private renderer = inject(RendererFactory2).createRenderer(null, null);

  private readonly THEME_KEY = 'angular-theme';
  private readonly STYLE_KEY = 'angular-style-theme';
  private readonly DARK_CLASS = 'ion-theme-dark';
  private readonly GLASS_CLASS = 'glass-effect';

  // Reactive theme state
  private currentTheme = signal<ThemeType>('light');
  private styleTheme = signal<StyleType>('default');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check for saved theme preference
      const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeType;

      // Check system preference if no saved theme
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

      this.setTheme(initialTheme);

      // Check for saved style theme preference
      const savedStyleTheme = localStorage.getItem(this.STYLE_KEY) as StyleType;
      const initialStyleTheme = savedStyleTheme || 'default';
      this.setStyleTheme(initialStyleTheme);
    } else {
      // Defaults for server-side rendering
      this.currentTheme.set('light');
      this.styleTheme.set('default');
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

    // Update document class
    if (isPlatformBrowser(this.platformId)) {
      if (theme === 'dark') {
        this.renderer.addClass(this.document.documentElement, this.DARK_CLASS);
      } else {
        this.renderer.removeClass(this.document.documentElement, this.DARK_CLASS);
      }
    }

    // Save preference
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
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

  // Style theme methods
  get styleThemeSignal() {
    return this.styleTheme.asReadonly();
  }

  get styleThemeValue(): StyleType {
    return this.styleTheme();
  }

  setStyleTheme(style: StyleType): void {
    this.styleTheme.set(style);

    // Update document class - remove all style classes first
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.removeClass(this.document.documentElement, this.GLASS_CLASS);

      // Add the appropriate class based on style
      if (style === 'liquid-glass') {
        this.renderer.addClass(this.document.documentElement, this.GLASS_CLASS);
      }

      // Save preference
      localStorage.setItem(this.STYLE_KEY, style);
    }
  }

  hasGlassEffect(): boolean {
    return this.styleTheme() === 'liquid-glass';
  }
}
