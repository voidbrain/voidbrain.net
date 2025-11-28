import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Language = 'en' | 'it';
export type Flavour = 'terminal' | 'newspaper' | 'cereal-box';
export type Color = 'purple' | 'orange' | 'green';
export type Theme = 'dark' | 'light';

export interface AppSettings {
  language: Language;
  flavour: Flavour;
  color: Color;
  theme: Theme;
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
    flavour: 'terminal',
    color: 'purple',
    theme: 'dark',
  };

  // Signals for reactive settings
  language = signal<Language>('en');
  flavour = signal<Flavour>('terminal');
  color = signal<Color>('purple');
  theme = signal<Theme>('dark');

  // Computed signal for full settings object
  currentSettings = computed<AppSettings>(() => ({
    language: this.language(),
    flavour: this.flavour(),
    color: this.color(),
    theme: this.theme(),
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
        // Use saved settings
        const settings: AppSettings = JSON.parse(stored);
        this.language.set(settings.language || this.defaultSettings.language);
        this.flavour.set(settings.flavour || this.defaultSettings.flavour);
        this.color.set(settings.color || this.defaultSettings.color);
        this.theme.set(settings.theme || this.defaultSettings.theme);
      } else {
        // First time user - use defaults (XLIFF compilation determines language)
        this.saveSettings();
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      // Fall back to defaults and save them
      this.saveSettings();
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
    if (settings.flavour !== undefined) this.flavour.set(settings.flavour);
    if (settings.color !== undefined) this.color.set(settings.color);
    if (settings.theme !== undefined) this.theme.set(settings.theme);
    this.saveSettings();
  }

  // Reset to defaults
  resetSettings(): void {
    this.language.set(this.defaultSettings.language);
    this.flavour.set(this.defaultSettings.flavour);
    this.color.set(this.defaultSettings.color);
    this.theme.set(this.defaultSettings.theme);
    if (this.isBrowser()) {
      this.saveSettings();
    }
  }

  // Get current settings object
  getSettings(): AppSettings {
    return this.currentSettings();
  }
}
