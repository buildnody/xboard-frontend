import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class LoginComponent {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  // FIX: Use new FormBuilder() as inject() seems to have inference issues in this environment.
  private fb = new FormBuilder();

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  login(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('请输入有效的邮箱和密码。');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.apiService.login({ email: email!, password: password! })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.data && res.data.auth_data) {
            this.authService.login(res.data.auth_data);
            this.router.navigate(['/app/dashboard']);
          } else {
            this.errorMessage.set('登录失败，无法获取认证令牌。');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(err.error?.message || '发生未知错误，请稍后重试。');
        },
      });
  }
}
