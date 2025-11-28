import { Injectable, signal, inject, RendererFactory2, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Settings } from '../settings';

export type FlavourType = 'terminal' | 'newspaper' | 'cereal-box';

@Injectable({
  providedIn: 'root',
})
export class Flavour {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private settings = inject(Settings);
  private isBrowser = false;

  private readonly FLAVOUR_CLASSES = {
    terminal: 'flavour-terminal',
    newspaper: 'flavour-newspaper',
    'cereal-box': 'flavour-cereal-box',
  };

  // Reactive flavour state
  private currentFlavour = signal<FlavourType>('terminal');

  constructor() {
    this.initializeFlavour();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private initializeFlavour(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Get flavour from settings service (which loads from settings localStorage)
      const settings = this.settings.getSettings();
      this.setFlavour(settings.flavour);
    } else {
      // Defaults for server-side rendering
      this.currentFlavour.set('terminal');
    }
  }

  get currentFlavourSignal() {
    return this.currentFlavour.asReadonly();
  }

  get currentFlavourValue(): FlavourType {
    return this.currentFlavour();
  }

  setFlavour(flavour: FlavourType): void {
    this.currentFlavour.set(flavour);

    // Update document classes
    if (isPlatformBrowser(this.platformId)) {
      // Remove all flavour classes first
      Object.values(this.FLAVOUR_CLASSES).forEach(className => {
        this.renderer.removeClass(this.document.documentElement, className);
      });

      // Add the appropriate flavour class (skip terminal as it's default)
      if (flavour !== 'terminal') {
        this.renderer.addClass(this.document.documentElement, this.FLAVOUR_CLASSES[flavour]);
      }
    }

    // Note: Flavour preference is now saved by Settings service when user saves settings
  }

  isTerminal(): boolean {
    return this.currentFlavour() === 'terminal';
  }

  isNewspaper(): boolean {
    return this.currentFlavour() === 'newspaper';
  }

  isCerealBox(): boolean {
    return this.currentFlavour() === 'cereal-box';
  }


}
