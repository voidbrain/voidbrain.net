import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Settings, Flavour } from '../../services/settings';

@Component({
  selector: 'app-flavour-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './flavour-dialog.html',
  styleUrl: './flavour-dialog.scss',
})
export class FlavourDialog {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveSettings = new EventEmitter<void>();

  // Input signals from parent app component
  @Input() saveFeedbackMessage = '';
  @Input() isSavingSettings = false;

  private settings = inject(Settings);

  flavours: { value: Flavour; label: string; checked: boolean }[] = [
    { value: 'terminal', label: 'Terminal', checked: true },
    { value: 'newspaper', label: 'Newspaper', checked: false },
    { value: 'cereal-box', label: 'Cereal box', checked: false },
  ];

  constructor() {
    this.loadCurrentSettings();
  }

  private loadCurrentSettings(): void {
    // Load current settings and set checked states
    const current = this.settings.getSettings();
    this.flavours.forEach((flavour) => (flavour.checked = flavour.value === current.flavour));
  }

  onFlavourChange(flavour: Flavour): void {
    this.flavours.forEach((f) => (f.checked = f.value === flavour));
  }

  doSaveSettings(): void {
    // Get the selected flavour and update settings
    const selectedFlavour = this.flavours.find(f => f.checked)?.value;
    if (selectedFlavour) {
      this.settings.updateSettings({ flavour: selectedFlavour });
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
