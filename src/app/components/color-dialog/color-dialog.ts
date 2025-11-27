import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Settings, Color } from '../../services/settings';

@Component({
  selector: 'app-color-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './color-dialog.html',
  styleUrl: './color-dialog.scss',
})
export class ColorDialog {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveSettings = new EventEmitter<void>();

  // Input signals from parent app component
  @Input() saveFeedbackMessage = '';
  @Input() isSavingSettings = false;

  private settings = inject(Settings);

  colors: { value: Color; label: string; checked: boolean }[] = [
    { value: 'purple', label: 'Purple', checked: true },
    { value: 'orange', label: 'Orange', checked: false },
    { value: 'green', label: 'Green', checked: false },
  ];

  constructor() {
    this.loadCurrentSettings();
  }

  private loadCurrentSettings(): void {
    // Load current settings and set checked states
    const current = this.settings.getSettings();

    this.colors.forEach((color) => (color.checked = color.value === current.color));
  }

  onColorChange(color: Color): void {
    this.colors.forEach((c) => (c.checked = c.value === color));
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
