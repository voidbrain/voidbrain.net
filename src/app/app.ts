import { Component, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Added CommonModule
import { AppLogoComponent } from './components/app-logo/app-logo'; // Import AppLogoComponent
import { WireframeSphere } from './components/wireframe-sphere/wireframe-sphere';
import { Theme } from './services/ui/theme';
import { TerminalComponent } from './components/terminal/terminal';
import { RandomFlashMatrix } from './components/random-flash-matrix/random-flash-matrix';
import { FxImageComponent } from './components/fx-image/fx-image';
import { SinusoidGraph } from './components/sinusoid-graph/sinusoid-graph';

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
    SinusoidGraph
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  @ViewChild('terminal', { static: true }) terminalEl!: ElementRef;
  @ViewChild('contentColumn', { static: true }) contentColumnEl!: ElementRef;
  protected readonly title = signal('voidbrain.net');
  isModalOpen = false; // Set to false by default, triggered by action if needed
  isInternalDialogVisible = true; // Set to true for initial display as per image
  private themeService = inject(Theme);

  protected selectedTheme = signal(this.themeService.currentThemeValue);
  protected showTop = signal(false);

  ngAfterViewInit() {
    // Add scroll listener to content-column instead of window
    const contentColumn = this.contentColumnEl.nativeElement;
    contentColumn.addEventListener('scroll', () => {
      const scrollY = contentColumn.scrollTop;
      console.log("content column scroll:", scrollY);
      // Show "top" button when scrolled down more than 200px
      this.showTop.set(scrollY > 200);
    });
  }

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

  goTo(dest: string) {
    const element = document.getElementById(dest);
    console.log(element)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // If element not found, scroll to top of content column
      const contentColumn = this.contentColumnEl.nativeElement;
      contentColumn.scrollTo({
        top: 0,
        behavior: 'smooth'
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
