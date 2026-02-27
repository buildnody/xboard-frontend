import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-container',
  template: `
    <div class="fixed top-5 right-5 z-[100] space-y-3 w-80">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div
          (click)="notificationService.remove(notification.id)"
          class="relative w-full p-4 rounded-xl shadow-lg cursor-pointer animate-slide-in-right"
          [class.bg-green-500/90]="notification.type === 'success'"
          [class.border-l-4]="true"
          [class.border-green-300]="notification.type === 'success'"
          [class.bg-red-500/90]="notification.type === 'error'"
          [class.border-red-300]="notification.type === 'error'"
          [class.bg-blue-500/90]="notification.type === 'info'"
          [class.border-blue-300]="notification.type === 'info'">
          <p class="text-white font-medium">{{ notification.message }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    :host .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class NotificationContainerComponent {
  notificationService = inject(NotificationService);
}
