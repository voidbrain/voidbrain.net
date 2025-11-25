import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-logo.html',
  styleUrl: './app-logo.scss',
})
export class AppLogoComponent {
  logoText: string = `
  █░░█      ▀    █ █▀▀▄          ▀      ▄▀ ▀▄
  █░░█ ▄▀▀█ █ ▄▀▀█ █▀▀▄ █▄▀ ▄▀▀█ █ █░▀█ █   █
  ▀▄▄▀ █▄▄█ █ ▀▄▄▀ █▄▄▀ █   ▀▄▄█ █ █  █ ▀▄ ▄▀
  `; // CRUSH logo
}
