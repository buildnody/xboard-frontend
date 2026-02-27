import { ChangeDetectionStrategy, Component, inject, signal, computed, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  // FIX: Use new FormBuilder() as inject() seems to have inference issues in this environment.
  private fb = new FormBuilder();
  private notificationService = inject(NotificationService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  tosUrl = signal<string>('#');

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    emailCode: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', [Validators.required]],
    inviteCode: ['', [Validators.required]],
    agreeToS: [false, [Validators.requiredTrue]],
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

  ngOnInit(): void {
    // Auto-fill and disable invite code from URL
    this.route.queryParams.subscribe(params => {
      const inviteCode = params['code'];
      if (inviteCode) {
        const inviteCodeControl = this.registerForm.get('inviteCode');
        if (inviteCodeControl) {
            inviteCodeControl.setValue(inviteCode);
            inviteCodeControl.disable();
        }
      }
    });

    // Fetch ToS URL
    this.apiService.getGuestConfig().subscribe({
      next: (res) => {
        if (res.data.tos_url) {
          this.tosUrl.set(res.data.tos_url);
        }
      },
      error: () => {
        // Silently fail, the link will just be '#'
        console.error('Failed to fetch guest config for ToS URL.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  sendVerificationCode(): void {
    const emailControl = this.registerForm.get('email');
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

  register(): void {
    if (this.registerForm.invalid) {
      this.errorMessage.set('请检查所有字段并同意服务条款。');
      return;
    }
    if (this.registerForm.value.password !== this.registerForm.value.passwordConfirmation) {
      this.errorMessage.set('两次输入的密码不一致。');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.registerForm.getRawValue();

    this.apiService.register({
      email: formValue.email!,
      password: formValue.password!,
      password_confirmation: formValue.passwordConfirmation!,
      invite_code: formValue.inviteCode!,
      email_code: formValue.emailCode!,
    })
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: () => {
        this.notificationService.showSuccess('注册成功！正在跳转到登录页面...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.message || '注册失败，请稍后重试。');
      },
    });
  }
}
