import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { UserStateService } from '../../../core/state/user-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmActionModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  return newPassword && confirmPassword && newPassword.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

interface ConfirmModalConfig {
  action: 'resetLink' | 'logout' | null;
  title: string;
  message: string;
  confirmText: string;
  confirmClass: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ConfirmActionModalComponent, FormsModule],
})
export class ProfileComponent {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  public userState = inject(UserStateService);
  private notificationService = inject(NotificationService);
  // FIX: Use new FormBuilder() as inject() seems to have inference issues in this environment.
  private fb = new FormBuilder();

  // --- Change Password ---
  isChangingPassword = signal(false);

  passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordMatchValidator });

  // --- Reset Subscription ---
  isResettingLink = signal(false);

  // --- Confirmation Modal State ---
  showConfirmModal = signal(false);
  confirmModalConfig = signal<ConfirmModalConfig>({ 
    action: null, 
    title: '', 
    message: '', 
    confirmText: '', 
    confirmClass: '' 
  });

  changePassword(): void {
    if (this.passwordForm.invalid) {
      if (this.passwordForm.hasError('passwordMismatch')) {
        this.notificationService.showError('两次输入的新密码不一致。');
      } else {
         this.notificationService.showError('请填写所有密码字段并确保新密码至少8位。');
      }
      return;
    }

    this.isChangingPassword.set(true);
    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
    
    this.apiService.changePassword({
      old_password: oldPassword!,
      new_password: newPassword!,
      new_password_confirmation: confirmPassword!,
    })
    .pipe(finalize(() => this.isChangingPassword.set(false)))
    .subscribe({
      next: () => {
        this.notificationService.showSuccess('密码修改成功！');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || '密码修改失败，请重试。');
      }
    });
  }

  requestResetSubscriptionLink(): void {
    this.confirmModalConfig.set({
      action: 'resetLink',
      title: '确认重置订阅链接',
      message: '您确定要重置订阅链接吗？旧链接将立即失效。此操作不可逆。',
      confirmText: '确认重置',
      confirmClass: 'bg-gradient-to-br from-yellow-500 to-orange-600'
    });
    this.showConfirmModal.set(true);
  }

  requestLogout(): void {
    this.confirmModalConfig.set({
      action: 'logout',
      title: '确认退出登录',
      message: '您确定要退出当前账户吗？',
      confirmText: '退出登录',
      confirmClass: 'bg-gradient-to-br from-red-600 to-red-800'
    });
    this.showConfirmModal.set(true);
  }

  cancelAction(): void {
    this.showConfirmModal.set(false);
  }

  confirmAction(): void {
    const action = this.confirmModalConfig().action;
    this.showConfirmModal.set(false);
    if (action === 'resetLink') {
      this.executeResetLink();
    } else if (action === 'logout') {
      this.executeLogout();
    }
  }

  private executeResetLink(): void {
    this.isResettingLink.set(true);
    this.apiService.resetSubscription()
      .pipe(finalize(() => this.isResettingLink.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('订阅链接已成功重置！');
          this.userState.triggerRefresh();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || '无法重置链接，请稍后重试。');
        }
      });
  }

  private executeLogout(): void {
    this.authService.logout();
  }
}
