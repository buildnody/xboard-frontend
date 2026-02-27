import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
    const id = this.nextId++;
    this.notifications.update(current => [...current, { id, message, type }]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }
  
  showSuccess(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }
  
  showError(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  remove(id: number): void {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }
}
