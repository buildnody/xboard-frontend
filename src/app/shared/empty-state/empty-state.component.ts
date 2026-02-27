import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="p-12 text-center text-text-muted">
      <ng-content select="[icon]"></ng-content>
      <h3 class="text-xl font-semibold text-text-main">{{ title() }}</h3>
      <p class="mt-2">{{ message() }}</p>
      <ng-content select="[actions]"></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input.required<string>();
}
