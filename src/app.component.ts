import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './app/core/services/theme.service';
import { NotificationContainerComponent } from './app/shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-notification-container></app-notification-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NotificationContainerComponent],
})
export class AppComponent {
  // Initialize the theme service to apply the theme on startup.
  private themeService = inject(ThemeService);
}
