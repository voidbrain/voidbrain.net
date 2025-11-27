import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Settings } from '../../services/settings';

@Component({
  selector: 'app-darkmode-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './darkmode-dialog.html',
  styleUrl: './darkmode-dialog.scss',
})
export class DarkmodeDialog {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveSettings = new EventEmitter<void>();

  // Input signals from parent app component
  @Input() saveFeedbackMessage = '';
  @Input() isSavingSettings = false;

  private settings = inject(Settings);

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

    this.darkModes.forEach((mode) => (mode.checked = mode.value === current.darkMode));
  }

  onDarkModeChange(mode: boolean): void {
    this.darkModes.forEach((d) => (d.checked = d.value === mode));
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
