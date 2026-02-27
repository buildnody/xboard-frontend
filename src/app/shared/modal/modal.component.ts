import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type ModalWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div 
        #modalBackdrop 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in" 
        (click)="closeOnBackdropClick($event)">
        <div 
          #modalElement 
          tabindex="-1" 
          role="dialog"
          aria-modal="true"
          class="bg-surface rounded-2xl shadow-neumorphic-raised w-full flex flex-col max-h-[90vh]" 
          [class.max-w-sm]="maxWidth() === 'sm'"
          [class.max-w-md]="maxWidth() === 'md'"
          [class.max-w-lg]="maxWidth() === 'lg'"
          [class.max-w-xl]="maxWidth() === 'xl'"
          [class.max-w-2xl]="maxWidth() === '2xl'"
          [class.max-w-3xl]="maxWidth() === '3xl'"
          (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="p-6 border-b border-dark flex justify-between items-center flex-shrink-0">
            <h3 class="text-lg font-semibold text-text-main">
                <ng-content select="[modal-title]"></ng-content>
            </h3>
            <button (click)="modalClose.emit()" class="text-text-muted hover:text-text-main transition-colors" aria-label="Close modal">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto">
            <ng-content select="[modal-body]"></ng-content>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-dark/50 border-t border-dark flex justify-end items-center gap-4 flex-shrink-0">
            <ng-content select="[modal-footer]"></ng-content>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'handleEscape()',
  },
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  maxWidth = input<ModalWidth>('lg');
  modalClose = output<void>();

  private modalElementRef = viewChild<ElementRef>('modalElement');
  
  constructor() {
    afterNextRender(() => {
        effect(() => {
          if (this.isOpen() && this.modalElementRef()) {
            setTimeout(() => {
                const modalEl = this.modalElementRef()?.nativeElement as HTMLElement;
                // Try to focus on the first focusable element.
                const focusable = modalEl.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ) as HTMLElement;

                if (focusable) {
                    focusable.focus();
                } else {
                    modalEl.focus();
                }
            }, 50); // Small delay to ensure modal is fully rendered
          }
        });
    });
  }

  closeOnBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).hasAttribute('modalBackdrop')) {
      this.modalClose.emit();
    }
  }

  handleEscape(): void {
    if (this.isOpen()) {
      this.modalClose.emit();
    }
  }
}
