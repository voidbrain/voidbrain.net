import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Added CommonModule
import { AppLogoComponent } from './components/app-logo/app-logo'; // Import AppLogoComponent
import { WireframeSphere } from './components/wireframe-sphere/wireframe-sphere';
import { MlGraphComponent } from './components/wireframe-fpv-plane/wireframe-fpv-plane';
import { Theme } from './services/ui/theme';
import { TerminalComponent } from './components/terminal/terminal';
import { RandomFlashMatrix } from './components/random-flash-matrix/random-flash-matrix';

@Component({
  selector: 'app-root',
  standalone: true, // Added standalone: true
  imports: [
    CommonModule, // Added CommonModule
    AppLogoComponent, // Added AppLogoComponent
    WireframeSphere,
    MlGraphComponent,
    RandomFlashMatrix,
    TerminalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @ViewChild('terminal', { static: true }) terminalEl!: ElementRef;
  protected readonly title = signal('voidbrain.net');
  isModalOpen = false; // Set to false by default, triggered by action if needed
  isInternalDialogVisible = true; // Set to true for initial display as per image
  private themeService = inject(Theme);

  protected selectedTheme = signal(this.themeService.currentThemeValue);

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  allowAction() {
    console.log('Allow action triggered');
    this.closeModal();
  }

  allowForSession() {
    console.log('Allow for session action triggered');
    this.closeModal();
  }

  denyAction() {
    console.log('Deny action triggered');
    this.closeModal();
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
