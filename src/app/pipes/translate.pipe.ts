import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation';

@Pipe({
  name: 'translate',
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(value: string): string {
    return this.translationService.translate(value);
  }
}
