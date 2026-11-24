import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'vb-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('voidbrain-net');
}
