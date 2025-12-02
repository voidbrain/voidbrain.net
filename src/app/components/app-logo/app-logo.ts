import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flavour } from '../../services/ui/flavour';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-logo.html',
  styleUrl: './app-logo.scss',
})
export class AppLogoComponent {
  private flavour = inject(Flavour);

  logoText = computed<string>(() => {
    const textLogo: string = 'Voidbrain()';
    const asciiLogo: string = `
  █░░█      ▀    █ █▀▀▄          ▀      ▄▀ ▀▄
  █░░█ ▄▀▀█ █ ▄▀▀█ █▀▀▄ █▄▀ ▄▀▀█ █ █░▀█ █   █
  ▀▄▄▀ █▄▄█ █ ▀▄▄▀ █▄▄▀ █   ▀▄▄█ █ █  █ ▀▄ ▄▀
  `;

    // Access the flavour signal directly to avoid issues
    return (this.flavour.currentFlavourSignal() === 'terminal') ?
      asciiLogo : textLogo;
  });
}
