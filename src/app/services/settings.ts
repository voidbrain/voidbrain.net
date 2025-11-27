import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Language = 'en' | 'it';
export type Theme = 'terminal' | 'second';
export type Color = 'purple' | 'orange' | 'green';

export interface AppSettings {
  language: Language;
  theme: Theme;
  color: Color;
  darkMode: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Settings {
  private readonly STORAGE_KEY = 'voidbrain-settings';

  // Inject PLATFORM_ID using inject() function
  private platformId = inject(PLATFORM_ID);

  // Default settings
  private defaultSettings: AppSettings = {
    language: 'en',
    theme: 'terminal',
    color: 'purple',
    darkMode: true,
  };

  // Signals for reactive settings
  language = signal<Language>('en');
  theme = signal<Theme>('terminal');
  color = signal<Color>('purple');
  darkMode = signal<boolean>(true);

  // Computed signal for full settings object
  currentSettings = computed<AppSettings>(() => ({
    language: this.language(),
    theme: this.theme(),
    color: this.color(),
    darkMode: this.darkMode(),
  }));

  constructor() {
    this.loadSettings();
  }

  // Check if we're in a browser environment
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Load settings from localStorage
  private loadSettings(): void {
    if (!this.isBrowser()) {
      return; // Skip localStorage access during SSR
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const settings: AppSettings = JSON.parse(stored);
        this.language.set(settings.language || this.defaultSettings.language);
        this.theme.set(settings.theme || this.defaultSettings.theme);
        this.color.set(settings.color || this.defaultSettings.color);
        this.darkMode.set(
          settings.darkMode !== undefined ? settings.darkMode : this.defaultSettings.darkMode,
        );
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      // Use defaults
    }
  }

  // Save settings to localStorage
  saveSettings(): void {
    if (!this.isBrowser()) {
      return; // Skip localStorage access during SSR
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSettings()));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  // Update settings - can pass partial settings object
  updateSettings(settings: Partial<AppSettings>): void {
    if (settings.language !== undefined) this.language.set(settings.language);
    if (settings.theme !== undefined) this.theme.set(settings.theme);
    if (settings.color !== undefined) this.color.set(settings.color);
    if (settings.darkMode !== undefined) this.darkMode.set(settings.darkMode);
    this.saveSettings();
  }

  // Reset to defaults
  resetSettings(): void {
    this.language.set(this.defaultSettings.language);
    this.theme.set(this.defaultSettings.theme);
    this.color.set(this.defaultSettings.color);
    this.darkMode.set(this.defaultSettings.darkMode);
    if (this.isBrowser()) {
      this.saveSettings();
    }
  }

  // Get current settings object
  getSettings(): AppSettings {
    return this.currentSettings();
  }
}
