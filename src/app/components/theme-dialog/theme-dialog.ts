import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Settings, Theme } from '../../services/settings';

@Component({
  selector: 'app-theme-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-dialog.html',
  styleUrl: './theme-dialog.scss',
})
export class ThemeDialog {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveSettings = new EventEmitter<void>();

  // Input signals from parent app component
  @Input() saveFeedbackMessage = '';
  @Input() isSavingSettings = false;

  private settings = inject(Settings);

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
    this.themes.forEach((mode) => (mode.checked = mode.value === current.theme));
  }

  onThemeChange(theme: Theme): void {
    this.themes.forEach((f) => (f.checked = f.value === theme));
  }

  doSaveSettings(): void {
    // Get the selected theme and update settings
    const selectedTheme = this.themes.find(t => t.checked)?.value;
    if (selectedTheme) {
      this.settings.updateSettings({ theme: selectedTheme });
    }
    // Emit save event to parent (settings logic moved to parent)
    this.saveSettings.emit();
  }

  resetToDefaults(): void {
    this.settings.resetSettings();
    this.loadCurrentSettings(); // Reload to reflect reset
  }

  cancel(): void {
    this.closeDialog.emit();
  }
}
