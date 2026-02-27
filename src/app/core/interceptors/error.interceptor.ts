import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notificationService.showError('您的会话已过期，请重新登录。');
        authService.logout();
      } else if (error.status >= 500) {
        notificationService.showError('服务器开小差了，请稍后重试。');
      } else if (error.status === 0 || error.status === -1) {
        notificationService.showError('网络连接失败，请检查您的网络。');
      }
      
      return throwError(() => error);
    })
  );
};
