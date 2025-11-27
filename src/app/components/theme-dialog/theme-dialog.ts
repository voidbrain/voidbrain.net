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
    { value: 'terminal', label: 'Terminal', checked: true },
    { value: 'second', label: 'Second', checked: false },
  ];

  constructor() {
    this.loadCurrentSettings();
  }

  private loadCurrentSettings(): void {
    // Load current settings and set checked states
    const current = this.settings.getSettings();
    this.themes.forEach((theme) => (theme.checked = theme.value === current.theme));
  }

  onThemeChange(theme: Theme): void {
    this.themes.forEach((t) => (t.checked = t.value === theme));
  }

  doSaveSettings(): void {
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
