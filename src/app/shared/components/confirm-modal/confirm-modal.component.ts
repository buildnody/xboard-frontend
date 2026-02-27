import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm-action-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen()" (modalClose)="close.emit()" [maxWidth]="'sm'">
      <div modal-title>{{ title() }}</div>
      <div modal-body>
        <p class="text-text-muted">{{ message() }}</p>
      </div>
      <div modal-footer>
        @if (showCancelButton()) {
          <button (click)="close.emit()" class="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-text-main bg-surface shadow-neumorphic-raised hover:shadow-neumorphic-pressed active:shadow-neumorphic-sunken transition-all">
            {{ cancelText() }}
          </button>
        }
        <button (click)="confirm.emit()" 
                [class]="confirmClass()"
                class="px-5 py-2.5 rounded-xl font-semibold text-white shadow-neumorphic-raised hover:shadow-neumorphic-pressed active:shadow-neumorphic-sunken transition-all"
                [class.w-full]="!showCancelButton()"
                [class.sm:w-auto]="showCancelButton()">
          {{ confirmText() }}
        </button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmActionModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('确认操作');
  message = input<string>('您确定要继续吗？此操作可能无法撤销。');
  confirmText = input<string>('确认');
  cancelText = input<string>('取消');
  confirmClass = input<string>('bg-gradient-to-br from-red-600 to-red-800');
  showCancelButton = input<boolean>(true);

  close = output<void>();
  confirm = output<void>();
}