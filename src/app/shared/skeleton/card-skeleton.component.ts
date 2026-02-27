import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-card-skeleton',
  standalone: true,
  template: `
    <div class="bg-surface rounded-2xl shadow-neumorphic-raised p-6 animate-pulse">
      <div class="h-6 bg-dark/50 rounded w-1/3 mb-6"></div>
      <div class="space-y-3">
        <div class="h-4 bg-dark/50 rounded"></div>
        <div class="h-4 bg-dark/50 rounded w-5/6"></div>
      </div>
       <div class="h-10 bg-dark/50 rounded w-1/2 mt-8"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSkeletonComponent {}
