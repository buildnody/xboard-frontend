import { ChangeDetectionStrategy, Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ForgotPasswordComponent implements OnDestroy {
  // FIX: Use new FormBuilder() as inject() seems to have inference issues in this environment.
  private fb = new FormBuilder();
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    emailCode: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', [Validators.required]]
  });

  // Verification code logic
  isSendingCode = signal(false);
  countdown = signal(0);
  private countdownTimer: any;

  verificationButtonText = computed(() => {
    if (this.countdown() > 0) {
      return `${this.countdown()}秒后重试`;
    }
    return '发送';
  });

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  sendVerificationCode(): void {
    const emailControl = this.resetForm.get('email');
    if (!emailControl?.valid) {
      this.errorMessage.set('请输入有效的邮箱地址。');
      return;
    }
    this.isSendingCode.set(true);
    this.errorMessage.set(null);

    this.apiService.sendEmailVerify(emailControl.value!)
      .pipe(finalize(() => this.isSendingCode.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('验证码已发送，请检查您的邮箱。');
          this.startCountdown();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(err.error?.message || '发送失败，请稍后重试。');
        },
      });
  }

  private startCountdown(): void {
    this.countdown.set(60);
    this.countdownTimer = setInterval(() => {
      this.countdown.update(value => {
        if (value > 1) {
          return value - 1;
        } else {
          clearInterval(this.countdownTimer);
          return 0;
        }
      });
    }, 1000);
  }

  resetPassword(): void {
    if (this.resetForm.invalid) {
      this.errorMessage.set('请完整填写所有字段。');
      return;
    }
    if (this.resetForm.value.password !== this.resetForm.value.passwordConfirmation) {
      this.errorMessage.set('两次输入的密码不一致。');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.resetForm.value;

    this.apiService.resetPassword({
      email: formValue.email!,
      email_code: formValue.emailCode!,
      password: formValue.password!,
      password_confirmation: formValue.passwordConfirmation!
    })
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: () => {
        this.notificationService.showSuccess('密码重置成功！正在跳转到登录页面...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.message || '重置失败，请检查您的信息。');
      }
    });
  }
}
