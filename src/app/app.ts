import { Component, inject, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // Added CommonModule
import { AppLogoComponent } from './components/app-logo/app-logo'; // Import AppLogoComponent
import { WireframeSphere } from './components/wireframe-sphere/wireframe-sphere';
import { Theme as ThemeService } from './services/ui/theme';
import { Color as ColorService } from './services/ui/color';
import { Flavour as FlavourService } from './services/ui/flavour';
import { Settings } from './services/settings';
import { TerminalComponent } from './components/terminal/terminal';
import { RandomFlashMatrix } from './components/random-flash-matrix/random-flash-matrix';
import { FxImageComponent } from './components/fx-image/fx-image';
import { SinusoidGraph } from './components/sinusoid-graph/sinusoid-graph';
import { CommonModal } from './components/common-modal/common-modal';
import { LangDialog } from './components/lang-dialog/lang-dialog';
import { ThemeDialog } from './components/theme-dialog/theme-dialog';
import { FlavourDialog } from './components/flavour-dialog/flavour-dialog';
import { ColorDialog } from './components/color-dialog/color-dialog';

@Component({
  selector: 'app-root',
  standalone: true, // Added standalone: true
  imports: [
    CommonModule, // Added CommonModule
    AppLogoComponent, // Added AppLogoComponent
    WireframeSphere,
    RandomFlashMatrix,
    TerminalComponent,
    FxImageComponent,
    SinusoidGraph,
    CommonModal,
    LangDialog,
    ThemeDialog,
    ColorDialog,
    FlavourDialog,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @ViewChild('contentColumn', { static: true }) contentColumnEl!: ElementRef;
  protected readonly title = signal('voidbrain.net');

  isLangModalOpen = signal(false);
  isFlavourModalOpen = signal(false);
  isColorModalOpen = signal(false);
  isThemeModalOpen = signal(false);

  isInternalDialogVisible = true; // Set to true for initial display as per image
  isSettingsModalOpen = false; // Settings dialog state
  private settings = inject(Settings);
  private themeService = inject(ThemeService);
  private colorService = inject(ColorService);
  private flavourService = inject(FlavourService);

  // Save feedback signals
  saveFeedbackMessage = signal('');
  isSavingSettings = signal(false);
  protected modalTitle = '';

  protected selectedTheme = signal(this.settings.theme);

  constructor() {
    // Apply theme from settings on app startup
    // const settings = this.settings.getSettings();
  }

  openLangModal() {
    this.modalTitle = 'Lang';
    // Reset save feedback signals
    this.saveFeedbackMessage.set('');
    this.isSavingSettings.set(false);
    // Close all other modals first
    this.isFlavourModalOpen.set(false);
    this.isColorModalOpen.set(false);
    this.isThemeModalOpen.set(false);
    // Open the requested modal
    this.isLangModalOpen.set(true);
  }

  openFlavourModal() {
    this.modalTitle = 'Flavour';
    // Reset save feedback signals
    this.saveFeedbackMessage.set('');
    this.isSavingSettings.set(false);
    // Close all other modals first
    this.isLangModalOpen.set(false);
    this.isColorModalOpen.set(false);
    this.isThemeModalOpen.set(false);
    // Open the requested modal
    this.isFlavourModalOpen.set(true);
  }

  openColorModal() {
    this.modalTitle = 'Colors';
    // Reset save feedback signals
    this.saveFeedbackMessage.set('');
    this.isSavingSettings.set(false);
    // Close all other modals first
    this.isLangModalOpen.set(false);
    this.isFlavourModalOpen.set(false);
    this.isThemeModalOpen.set(false);
    // Open the requested modal
    this.isColorModalOpen.set(true);
  }

  openThemeModal() {
    this.modalTitle = 'Theme';
    // Reset save feedback signals
    this.saveFeedbackMessage.set('');
    this.isSavingSettings.set(false);
    // Close all other modals first
    this.isLangModalOpen.set(false);
    this.isFlavourModalOpen.set(false);
    this.isColorModalOpen.set(false);
    // Open the requested modal
    this.isThemeModalOpen.set(true);
  }

  closeLangModal() {
    this.isLangModalOpen.set(false);
  }

  closeFlavourModal() {
    this.isFlavourModalOpen.set(false);
  }

  closeColorModal() {
    this.isColorModalOpen.set(false);
  }

  closeThemeModal() {
    this.isThemeModalOpen.set(false);
  }

  // Common close method for modal X button and backdrop click
  closeAnyModal() {
    this.closeLangModal();
    this.closeFlavourModal();
    this.closeColorModal();
    this.closeThemeModal();
  }

  // Save settings with feedback - shows message, waits 2 sec, then closes modal
  async saveSettings() {
    this.isSavingSettings.set(true);
    this.saveFeedbackMessage.set('Settings saved successfully!');

    // Wait 2 seconds with loading indicator
    setTimeout(() => {
      this.isSavingSettings.set(false);
      this.closeAnyModal();

      // Clear message after modal closes
      setTimeout(() => {
        this.saveFeedbackMessage.set('');
      }, 500);
    }, 2000);
  }

  // Specific save methods for different dialogs
  saveLangSettings() {
    this.saveSettings();
  }

  saveColorSettings() {
    // Get current color setting and apply it
    const currentSettings = this.settings.getSettings();
    this.colorService.setColor(currentSettings.color);

    // Save the general settings
    this.saveSettings();
  }

  saveFlavourSettings() {
    // Get current flavour setting and apply it
    const currentSettings = this.settings.getSettings();
    this.flavourService.setFlavour(currentSettings.flavour);

    // Save the general settings
    this.saveSettings();
  }

  saveThemeSettings() {
    // Get current theme setting and apply it
    const currentSettings = this.settings.getSettings();
    this.themeService.setTheme(currentSettings.theme);

    // Save the general settings
    this.saveSettings();
  }

  openSettingsModal() {
    this.isSettingsModalOpen = true;
  }

  closeSettingsModal() {
    this.isSettingsModalOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (
      this.isColorModalOpen() ||
      this.isThemeModalOpen() ||
      this.isLangModalOpen() ||
      this.isFlavourModalOpen()
    ) {
      this.closeLangModal();
      this.closeFlavourModal();
      this.closeColorModal();
      this.closeThemeModal();
    }
  }

  onBackdropClick() {
    // Only close if clicking the backdrop itself, not the modal content
    if (
      this.isColorModalOpen() ||
      this.isThemeModalOpen() ||
      this.isLangModalOpen() ||
      this.isFlavourModalOpen()
    ) {
      this.closeLangModal();
      this.closeFlavourModal();
      this.closeColorModal();
      this.closeThemeModal();
    }
  }

  goTo(dest: string) {
    const contentColumn = this.contentColumnEl.nativeElement;
    const element = document.getElementById(dest);

    if (element) {
      // Get sticky header height to account for it
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;

      // Calculate position relative to contentColumn and adjust for sticky header
      const elementRect = element.getBoundingClientRect();
      const contentRect = contentColumn.getBoundingClientRect();
      let relativeTop =
        elementRect.top - contentRect.top + contentColumn.scrollTop - headerHeight - 10; // +10 for margin

      // Ensure we don't scroll above the content
      relativeTop = Math.max(0, relativeTop);

      // Add highlight class for visual feedback
      element.classList.add('goto-highlight');

      // Remove highlight class after animation completes
      setTimeout(() => {
        element.classList.remove('goto-highlight');
      }, 1200); // Match animation duration

      contentColumn.scrollTo({
        top: relativeTop,
        behavior: 'smooth',
      });
    } else {
      // If element not found, scroll to top of content column
      contentColumn.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  codeDiffContent: string = `
            ------- SEARCH
            if len(lsp) > maxLSPs {
              remaining := len(lsp) - maxLSPs
              lspList = append(lspList,
                t.S().Base.Foreground(t.FgMuted).Render(fmt.Sprintf("...and %d more", remaining)),
                t.S().Base.Foreground(t.FgMuted).Render(fmt.Sprintf("...and %d more", remaining)),
              )
            }
            =======
            +++++++ REPLACE

            ------- SEARCH
            if len(mcps) > maxMCPs {
              remaining := len(mcps) - maxMCPs
              mcpList = append(mcpList,
              remaining := len(mcps) - maxMCPs
              mcpList = append(mcpList,
                t.S().Base.Foreground(t.FgMuted).Render(fmt.Sprintf("...and %d more", remaining)),
              )
            }
            =======
            +++++++ REPLACE
  `;
}
