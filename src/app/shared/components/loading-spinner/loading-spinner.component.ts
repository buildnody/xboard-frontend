import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="flex justify-center items-center p-16">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-start"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {}
