import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Settings, Language, Theme, Color } from '../../services/settings';

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

  themes: { value: Theme; label: string; checked: boolean }[] = [
    { value: 'terminal', label: 'Terminal', checked: true },
    { value: 'second', label: 'Second', checked: false },
  ];

  colors: { value: Color; label: string; checked: boolean }[] = [
    { value: 'purple', label: 'Purple', checked: true },
    { value: 'orange', label: 'Orange', checked: false },
    { value: 'green', label: 'Green', checked: false },
  ];

  darkModes: { value: boolean; label: string; checked: boolean }[] = [
    { value: true, label: 'Dark', checked: true },
    { value: false, label: 'Light', checked: false },
  ];

  constructor() {
    this.loadCurrentSettings();
  }

  private loadCurrentSettings(): void {
    // Load current settings and set checked states
    const current = this.settings.getSettings();

    this.languages.forEach((lang) => (lang.checked = lang.value === current.language));
    this.themes.forEach((theme) => (theme.checked = theme.value === current.theme));
    this.colors.forEach((color) => (color.checked = color.value === current.color));
    this.darkModes.forEach((mode) => (mode.checked = mode.value === current.darkMode));
  }

  onLanguageChange(lang: Language): void {
    this.languages.forEach((l) => (l.checked = l.value === lang));
  }

  onThemeChange(theme: Theme): void {
    this.themes.forEach((t) => (t.checked = t.value === theme));
  }

  onColorChange(color: Color): void {
    this.colors.forEach((c) => (c.checked = c.value === color));
  }

  onDarkModeChange(mode: boolean): void {
    this.darkModes.forEach((d) => (d.checked = d.value === mode));
  }

  saveSettings(): void {
    // Get selected values
    const selectedLanguage = this.languages.find((l) => l.checked)?.value || 'en';
    const selectedTheme = this.themes.find((t) => t.checked)?.value || 'terminal';
    const selectedColor = this.colors.find((c) => c.checked)?.value || 'purple';
    const selectedDarkMode = this.darkModes.find((m) => m.checked)?.value ?? true;

    // Update settings
    this.settings.updateSettings({
      language: selectedLanguage,
      theme: selectedTheme,
      color: selectedColor,
      darkMode: selectedDarkMode,
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
