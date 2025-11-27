import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-common-modal',
  imports: [CommonModule],
  templateUrl: './common-modal.html',
  styleUrl: './common-modal.scss',
})
export class CommonModal {
  @Input() isOpen = false;
  @Input() title = '';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  close(): void {
    // Don't set internal state, just emit event for parent to handle
    this.closed.emit();
  }

  confirm(): void {
    // Don't set internal state, just emit event for parent to handle
    this.confirmed.emit();
  }

  cancel(): void {
    // Don't set internal state, just emit event for parent to handle
    this.cancelled.emit();
  }

  onBackdropClick(event: Event): void {
    // Handle both mouse and keyboard events
    if ('target' in event && 'currentTarget' in event) {
      if (event.target === event.currentTarget) {
        this.close();
      }
    }
  }
}
