import { Injectable, inject } from '@angular/core';
import { Settings } from './settings';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private settings = inject(Settings);

  // Translation maps for different languages
  private translations: { [lang: string]: { [key: string]: string } } = {
    en: {
      'navigation.plugins': 'Plugins',
      'navigation.modules': 'Modules',
      'navigation.addon': 'Add-On',
      'navigation.extra': 'Extra',
      'navigation.links': 'Links',
      'sections.plugins.title': 'Plugins',
    },
    it: {
      'navigation.plugins': 'Plugin',
      'navigation.modules': 'Moduli',
      'navigation.addon': 'Add-On',
      'navigation.extra': 'Extra',
      'navigation.links': 'Link',
      'sections.plugins.title': 'Plugin',
    },
  };

  constructor() {
    // Initialize with current language
    const currentSettings = this.settings.getSettings();
    this.setLanguage(currentSettings.language);
  }

  setLanguage(lang: string): void {
    this.currentLang = lang;
  }

  translate(key: string): string {
    const lang = this.settings.getSettings().language;
    return this.translations[lang]?.[key] || key;
  }

  private currentLang = 'en';
}
