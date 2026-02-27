import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button (click)="themeService.toggleTheme()" 
            class="w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-accent-start text-text-muted hover:bg-dark/50 hover:text-text-main"
            aria-label="Toggle theme">
      <span class="font-medium">切换主题</span>
      <div class="relative">
        <!-- Sun Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-opacity duration-300" 
             [class.opacity-0]="themeService.theme() === 'dark'"
             [class.opacity-100]="themeService.theme() === 'light'"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <!-- Moon Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 absolute top-0 left-0 transition-opacity duration-300"
             [class.opacity-100]="themeService.theme() === 'dark'"
             [class.opacity-0]="themeService.theme() === 'light'"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ThemeToggleComponent {
  public themeService = inject(ThemeService);
}
