import { Injectable, signal, effect, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_TOKEN_KEY, LAST_ACTIVITY_KEY } from '../constants';

const FIVE_HOURS_IN_MS = 5 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  
  readonly token = signal<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  readonly isAuthenticated = computed(() => !!this.token());

  constructor() {
    this.checkActivity();

    effect(() => {
      const currentToken = this.token();
      if (currentToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, currentToken);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    });
  }
  
  private checkActivity(): void {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity && (Date.now() - parseInt(lastActivity, 10)) > FIVE_HOURS_IN_MS) {
        console.log('会话因长时间未活动而过期。');
        this.logout();
    } else {
        this.recordActivity();
    }
  }

  public recordActivity(): void {
    if (this.isAuthenticated()) {
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }

  login(token: string): void {
    this.token.set(token);
    this.recordActivity();
  }

  logout(): void {
    this.token.set(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    this.router.navigate(['/login']);
  }
}