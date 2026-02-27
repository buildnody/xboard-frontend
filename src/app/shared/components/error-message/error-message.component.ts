import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  template: `
    <div class="p-8 text-center text-red-400">
      <p>{{ message() || '加载数据时发生错误。' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
  message = input<string | null>();
}
