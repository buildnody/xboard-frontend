import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'app_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem(THEME_KEY, currentTheme);
      if (currentTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    });
  }

  private getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    // Default to dark theme if no preference is stored
    return 'dark';
  }

  toggleTheme(): void {
    this.theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }
}
