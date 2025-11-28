import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Settings, Language, Theme, Color, Flavour } from '../../services/settings';

@Component({
  selector: 'app-settings-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.scss',
})
export class SettingsDialog {
  @Output() closeDialog = new EventEmitter<void>();

  private settings = inject(Settings);

  // Settings options
  languages: { value: Language; label: string; checked: boolean }[] = [
    { value: 'en', label: 'English', checked: true },
    { value: 'it', label: 'Italiano', checked: false },
  ];

  flavours: { value: Flavour; label: string; checked: boolean }[] = [
    { value: 'terminal', label: 'Terminal', checked: true },
    { value: 'newspaper', label: 'Newspaper', checked: false },
    { value: 'cereal-box', label: 'Cereal box', checked: false },
  ];

  colors: { value: Color; label: string; checked: boolean }[] = [
    { value: 'purple', label: 'Purple', checked: true },
    { value: 'orange', label: 'Orange', checked: false },
    { value: 'green', label: 'Green', checked: false },
  ];

  themes: { value: Theme; label: string; checked: boolean }[] = [
    { value: 'dark', label: 'Dark', checked: true },
    { value: 'light', label: 'Light', checked: false },
  ];

  constructor() {
    this.loadCurrentSettings();
  }

  private loadCurrentSettings(): void {
    // Load current settings and set checked states
    const current = this.settings.getSettings();

    this.languages.forEach((lang) => (lang.checked = lang.value === current.language));
    this.flavours.forEach((flavour) => (flavour.checked = flavour.value === current.flavour));
    this.colors.forEach((color) => (color.checked = color.value === current.color));
    this.themes.forEach((mode) => (mode.checked = mode.value === current.theme));
  }

  onLanguageChange(lang: Language): void {
    this.languages.forEach((l) => (l.checked = l.value === lang));
  }

  onFlavourChange(Flavour: Flavour): void {
    this.flavours.forEach((t) => (t.checked = t.value === Flavour));
  }

  onColorChange(color: Color): void {
    this.colors.forEach((c) => (c.checked = c.value === color));
  }

  onThemeChange(mode: Theme): void {
    this.themes.forEach((d) => (d.checked = d.value === mode));
  }

  saveSettings(): void {
    // Get selected values
    const selectedLanguage = this.languages.find((l) => l.checked)?.value || 'en';
    const selectedFlavour = this.flavours.find((t) => t.checked)?.value || 'terminal';
    const selectedColor = this.colors.find((c) => c.checked)?.value || 'purple';
    const selectedTheme = this.themes.find((m) => m.checked)?.value ?? 'dark';

    // Update settings
    this.settings.updateSettings({
      language: selectedLanguage,
      flavour: selectedFlavour,
      color: selectedColor,
      theme: selectedTheme,
    });

    this.closeDialog.emit();
  }

  resetToDefaults(): void {
    this.settings.resetSettings();
    this.loadCurrentSettings(); // Reload to reflect reset
  }

  cancel(): void {
    this.closeDialog.emit();
  }
}
