import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { InviteInfo, CommissionLog } from '../../../models/api.model';
import { NotificationService } from '../../../core/services/notification.service';
import { UserStateService } from '../../../core/state/user-state.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    DatePipe, 
    ReactiveFormsModule, 
    LoadingSpinnerComponent, 
    ErrorMessageComponent, 
    EmptyStateComponent
  ],
})
export class InvitesComponent implements OnInit {
  private apiService = inject(ApiService);
  private clipboard = navigator.clipboard;
  private notificationService = inject(NotificationService);
  private userState = inject(UserStateService);
  // FIX: Use new FormBuilder() as inject() seems to have inference issues in this environment.
  private fb = new FormBuilder();

  inviteInfo = signal<InviteInfo | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  isGenerating = signal(false);
  copySuccessCode = signal<string | null>(null);

  // Commission Logs
  commissionLogs = signal<CommissionLog[]>([]);
  loadingLogs = signal(true);
  logsError = signal<string | null>(null);

  // Pagination for Commission Logs
  logsCurrentPage = signal(1);
  logsPageSize = signal(10);
  logsTotal = signal(0);

  // --- Commission Transfer ---
  showTransferModal = signal(false);
  isTransferring = signal(false);
  transferError = signal<string | null>(null);

  transferForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  maxTransferAmount = computed(() => {
      const info = this.inviteInfo();
      return info ? info.stat[4] / 100 : 0;
  });

  constructor() {
    effect(() => {
      const maxAmount = this.maxTransferAmount();
      const amountControl = this.transferForm.get('amount');
      if (amountControl) {
        amountControl.setValidators([Validators.required, Validators.min(0.01), Validators.max(maxAmount)]);
        amountControl.updateValueAndValidity();
      }
    });
  }

  logsTotalPages = computed(() => {
    return Math.ceil(this.logsTotal() / this.logsPageSize());
  });

  ngOnInit(): void {
    this.loadInvites();
    this.loadCommissionLogs();
  }

  loadInvites(): void {
    this.loading.set(true);
    this.apiService.getInvites().subscribe({
      next: (res) => {
        // Fix for timestamp: API returns seconds, pipe needs milliseconds.
        if (res.data && res.data.codes) {
          res.data.codes = res.data.codes.map(code => ({
            ...code,
            created_at: Number(code.created_at) * 1000
          }));
        }
        this.inviteInfo.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || '无法加载邀请信息');
        this.loading.set(false);
      },
    });
  }

  loadCommissionLogs(): void {
    this.loadingLogs.set(true);
    this.logsError.set(null);
    this.apiService.getCommissionLogs(this.logsCurrentPage(), this.logsPageSize()).subscribe({
      next: (res) => {
        const logs = (res.data || []).map((log: any): CommissionLog => ({
          trade_no: log.trade_no,
          order_amount: log.order_amount,
          commission_amount: log.get_amount, // Map API's `get_amount` to our model's `commission_amount`
          commission_status: 1, // Assume 'paid' (1) as the API doesn't provide status for this log
          created_at: log.created_at * 1000, // convert to ms
        }));
        this.commissionLogs.set(logs);
        this.logsTotal.set(res.total);
        this.loadingLogs.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.logsError.set(err.error?.message || '无法加载佣金记录');
        this.loadingLogs.set(false);
      }
    });
  }
  
  changeLogsPage(newPage: number): void {
    if (newPage < 1 || newPage > this.logsTotalPages() || newPage === this.logsCurrentPage()) {
      return;
    }
    this.logsCurrentPage.set(newPage);
    this.loadCommissionLogs();
  }

  generateInviteCode(): void {
    this.isGenerating.set(true);
    this.apiService.generateInviteCode()
      .pipe(finalize(() => this.isGenerating.set(false)))
      .subscribe({
        next: () => {
          this.loadInvites();
          this.notificationService.showSuccess('新的邀请码已生成！');
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || '生成邀请码失败');
        },
      });
  }

  copyInviteLink(code: string): void {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const inviteUrl = `${baseUrl}#/register?code=${code}`;
    
    this.clipboard.writeText(inviteUrl).then(() => {
      this.notificationService.showSuccess('邀请链接已复制！');
      this.copySuccessCode.set(code);
      setTimeout(() => this.copySuccessCode.set(null), 2000);
    }).catch(err => {
      console.error('无法复制邀请链接', err);
      this.notificationService.showError('复制失败，您的浏览器可能不支持此操作。');
    });
  }

  openTransferModal(): void {
    this.transferForm.reset();
    this.transferError.set(null);
    this.showTransferModal.set(true);
  }

  confirmTransfer(): void {
    if (this.transferForm.invalid) {
      this.transferError.set('请输入有效的划转金额。');
      return;
    }

    this.isTransferring.set(true);
    this.transferError.set(null);

    const amountInCents = Math.round(this.transferForm.value.amount! * 100);

    this.apiService.transferCommission(amountInCents)
      .pipe(finalize(() => this.isTransferring.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('佣金划转成功！');
          this.showTransferModal.set(false);
          this.loadInvites(); // Reload invite info to show updated balance
          this.userState.triggerRefresh(); // Also refresh global user state
        },
        error: (err) => {
          this.transferError.set(err.error?.message || '划转失败，请稍后重试。');
        }
      });
  }
}
