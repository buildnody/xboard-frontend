import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { OrderDetail, PaymentMethod, CheckoutResponse } from '../../../../models/api.model';
import { Subscription, interval, switchMap, finalize } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, DatePipe],
})
export class OrderStatusComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  
  tradeNo = signal('');
  orderDetail = signal<OrderDetail | null>(null);
  
  loading = signal(true);
  error = signal<string | null>(null);
  isCancelling = signal(false);
  
  paymentMethods = signal<PaymentMethod[]>([]);
  loadingPaymentMethods = signal(false);
  selectedPaymentMethodId = signal<number | null>(null);
  
  isCheckingOut = signal(false);
  
  private pollingSub?: Subscription;

  originalPrice = computed(() => {
    const order = this.orderDetail();
    if (!order) return 0;
    return order.total_amount + (order.balance_amount ?? 0);
  });
  
  ngOnInit(): void {
    const tradeNo = this.route.snapshot.paramMap.get('trade_no');
    if (!tradeNo) {
        this.error.set('无效的订单号');
        this.loading.set(false);
        return;
    }
    this.tradeNo.set(tradeNo);
    this.loadInitialData(tradeNo);
  }

  loadInitialData(tradeNo: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.stopPolling();

    this.apiService.getOrderDetail(tradeNo).subscribe({
        next: (order) => {
            const orderData = order.data;
            if (orderData && orderData.created_at) {
              orderData.created_at = orderData.created_at * 1000;
            }
            this.orderDetail.set(orderData);

            if (orderData.status === 0) {
              // This is a pending order, so show payment options.
              this.fetchPaymentMethods();
              this.startStatusPolling(tradeNo);
            }
            
            this.loading.set(false);
        },
        error: (err) => {
            this.error.set(err.error?.message || '无法获取订单详情');
            this.loading.set(false);
        }
    });
  }
  
  fetchPaymentMethods(): void {
    this.loadingPaymentMethods.set(true);
    this.apiService.getPaymentMethods(this.tradeNo()).subscribe({
      next: (res) => {
        this.paymentMethods.set(res.data);
        if (res.data.length > 0) {
            this.selectedPaymentMethodId.set(res.data[0].id);
        }
        this.loadingPaymentMethods.set(false);
      },
      error: () => {
        this.notificationService.showError('无法加载支付方式');
        this.loadingPaymentMethods.set(false);
      }
    });
  }

  checkout(): void {
    const tradeNo = this.tradeNo();
    const methodId = this.selectedPaymentMethodId();
    if (!tradeNo || methodId === null) {
      this.notificationService.showError('请选择一种支付方式。');
      return;
    }
    
    this.isCheckingOut.set(true);
    
    const order = this.orderDetail();
    const useBalance = !!(order && order.balance_amount && order.balance_amount > 0);

    this.apiService.checkout({ trade_no: tradeNo, method: methodId, use_balance: useBalance })
      .pipe(finalize(() => this.isCheckingOut.set(false)))
      .subscribe({
        next: (res) => {
          // Based on network response, a successful checkout returns:
          // { "type": 1, "data": "https://payment.url..." }
          if (res.type === 1 && typeof res.data === 'string' && res.data.length > 0) {
            window.location.href = res.data;
          } else {
            // Use `res.message` from failed responses. The `||` provides a fallback.
            this.notificationService.showError(res.message || '获取支付链接失败。');
          }
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || '支付请求失败，请重试。');
        }
      });
  }

  startStatusPolling(tradeNo: string): void {
      this.stopPolling();
      this.pollingSub = interval(3000)
        .pipe(switchMap(() => this.apiService.getOrderDetail(tradeNo)))
        .subscribe({
            next: (res) => {
                const updatedOrder = res.data;
                if (updatedOrder && updatedOrder.created_at) {
                  updatedOrder.created_at = updatedOrder.created_at * 1000;
                }
                this.orderDetail.set(updatedOrder);
                if (updatedOrder.status !== 0) {
                    this.stopPolling();
                }
            },
            error: (err) => {
                console.error('订单状态轮询失败', err);
                this.stopPolling();
            }
        });
  }

  stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  cancelOrder(): void {
    this.isCancelling.set(true);
    this.error.set(null);
    this.apiService.cancelOrder(this.tradeNo())
      .pipe(finalize(() => this.isCancelling.set(false)))
      .subscribe({
        next: () => {
          this.stopPolling();
          this.notificationService.showSuccess('订单已取消。');
          this.router.navigate(['/app/orders']);
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || '无法取消订单，请稍后重试。');
        }
      });
  }

  getPeriodName(periodKey: string): string {
    const periodMap: { [key: string]: string } = {
      month_price: '月付',
      quarter_price: '季付',
      half_year_price: '半年付',
      year_price: '年付',
      two_year_price: '二年付',
      three_year_price: '三年付',
      onetime_price: '一次性',
      reset_price: '重置包',
      price: '一次性'
    };
    return periodMap[periodKey] || periodKey;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}