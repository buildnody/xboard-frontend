import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { Order } from '../../../../models/api.model';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';

interface OrderViewModel extends Order {
  statusText: string;
  statusClass: string;
}

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, DatePipe]
})
export class OrdersListComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  
  orders = signal<OrderViewModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  processingOrder = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.apiService.getOrders().subscribe({
      next: (res) => {
        const mappedOrders = res.data.map((order: Order): OrderViewModel => {
          let statusText = '未知';
          let statusClass = 'bg-gray-500';

          switch (Number(order.status)) {
            case 0: statusText = '待支付'; statusClass = 'bg-yellow-500'; break;
            case 1: statusText = '已完成'; statusClass = 'bg-green-500'; break;
            case 3: statusText = '已完成'; statusClass = 'bg-green-500'; break;
            case 2: statusText = '已取消'; statusClass = 'bg-red-600'; break;
            default: statusText = '已过期'; statusClass = 'bg-gray-500'; break;
          }
          
          const trueTotalAmount = order.total_amount + (order.balance_amount ?? 0);

          return {
            ...order,
            total_amount: trueTotalAmount,
            created_at: order.created_at * 1000,
            statusText,
            statusClass
          };
        });
        this.orders.set(mappedOrders);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('无法加载订单列表');
        this.loading.set(false);
      }
    });
  }

  handleViewPendingOrder(tradeNo: string): void {
    this.processingOrder.set(tradeNo);
    this.apiService.cancelOrder(tradeNo)
      .pipe(finalize(() => this.processingOrder.set(null)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('已为您清理失效订单，请重新选择计划下单。');
          this.router.navigate(['/app/plans']);
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || '清理订单失败，请稍后重试。');
        }
      });
  }

  cancelOrder(tradeNo: string): void {
    if (!confirm('您确定要取消此订单吗？')) {
        return;
    }
    this.processingOrder.set(tradeNo);
    this.apiService.cancelOrder(tradeNo)
      .pipe(finalize(() => this.processingOrder.set(null)))
      .subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          alert('取消订单失败: ' + (err.error?.message || '未知错误'));
        }
      });
  }
}