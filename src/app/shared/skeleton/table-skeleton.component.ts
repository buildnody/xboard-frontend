import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface rounded-2xl shadow-neumorphic-raised overflow-hidden">
      <!-- Header -->
      <div class="bg-dark/50 p-4">
        <div class="h-5 bg-dark rounded w-3/4"></div>
      </div>
      <!-- Body -->
      <div class="p-6 space-y-4 animate-pulse">
        @for (_ of rowArray(); track $index) {
          <div class="grid grid-cols-5 gap-4">
            <div class="h-4 bg-dark/50 rounded col-span-2"></div>
            <div class="h-4 bg-dark/50 rounded col-span-1"></div>
            <div class="h-4 bg-dark/50 rounded col-span-1"></div>
            <div class="h-4 bg-dark/50 rounded col-span-1"></div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSkeletonComponent {
  rows = input<number>(5);

  // Helper to use in the template for iteration
  rowArray(): unknown[] {
    return new Array(this.rows());
  }
}
