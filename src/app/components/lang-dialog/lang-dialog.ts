import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Settings, Language } from '../../services/settings';

@Component({
  selector: 'app-lang-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './lang-dialog.html',
  styleUrl: './lang-dialog.scss',
})
export class LangDialog {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveSettings = new EventEmitter<void>();

  // Input signals from parent app component
  @Input() saveFeedbackMessage = '';
  @Input() isSavingSettings = false;

  private settings = inject(Settings);

  // Settings options
  languages: { value: Language; label: string; checked: boolean }[] = [
    { value: 'en', label: 'English', checked: true },
    { value: 'it', label: 'Italiano', checked: false },
  ];

  constructor() {
    this.loadCurrentSettings();
  }

  private loadCurrentSettings(): void {
    // Load current settings and set checked states
    const current = this.settings.getSettings();

    this.languages.forEach((lang) => (lang.checked = lang.value === current.language));
  }

  onLanguageChange(lang: Language): void {
    this.languages.forEach((l) => (l.checked = l.value === lang));
  }

  doSaveSettings(): void {
    // Get the selected language and update settings
    const selectedLanguage = this.languages.find(l => l.checked)?.value;
    if (selectedLanguage) {
      this.settings.updateSettings({ language: selectedLanguage });
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
