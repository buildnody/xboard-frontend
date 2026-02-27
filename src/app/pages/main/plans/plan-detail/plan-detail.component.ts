import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Plan, CouponCheckResponse, ApiResponse } from '../../../../models/api.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

interface BillingPeriod {
  key: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule],
})
export class PlanDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  plan = signal<Plan | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedPeriodKey = signal<string | null>(null);
  couponCode = signal('');
  couponValidation = signal<{ status: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ status: 'idle' });
  discountAmount = signal(0);
  isPlacingOrder = signal(false);

  availablePeriods = computed<BillingPeriod[]>(() => {
    const p = this.plan();
    if (!p) return [];

    const periods: BillingPeriod[] = [];
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

    for (const key in periodMap) {
      if (p[key as keyof Plan] != null) {
        periods.push({
          key,
          name: periodMap[key],
          price: p[key as keyof Plan] as number
        });
      }
    }
    
    // If only 'price' exists and no other periods, it's a one-time payment.
    if (periods.length === 1 && periods[0].key === 'price') {
      return periods;
    }

    // Filter out 'price' if other periods are available to avoid duplication
    return periods.filter(period => period.key !== 'price');
  });

  selectedPeriodName = computed(() => {
    const period = this.availablePeriods().find(p => p.key === this.selectedPeriodKey());
    return period?.name ?? '';
  });

  selectedPeriodPrice = computed(() => {
    const period = this.availablePeriods().find(p => p.key === this.selectedPeriodKey());
    return period?.price ?? 0;
  });

  finalAmount = computed(() => {
    const original = this.selectedPeriodPrice();
    const discount = this.discountAmount();
    return Math.max(0, original - discount);
  });

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id');
    if (!planId) {
      this.error.set('无效的套餐ID');
      this.loading.set(false);
      return;
    }

    this.apiService.getPlans().subscribe({
      next: res => {
        const foundPlan = res.data.find(p => p.id === +planId);
        if (foundPlan) {
          this.plan.set(foundPlan);
          const periods = this.availablePeriods();
          if (periods.length > 0) {
            this.selectedPeriodKey.set(periods[0].key);
          }
        } else {
          this.error.set('未找到指定的套餐');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('无法加载套餐信息');
        this.loading.set(false);
      }
    });
  }

  applyCoupon(): void {
    const code = this.couponCode().trim();
    const planId = this.plan()?.id;
    if (!code || !planId) {
      this.couponValidation.set({ status: 'error', message: '请输入优惠码' });
      return;
    }

    this.couponValidation.set({ status: 'loading' });
    this.apiService.checkCoupon({ code, plan_id: planId }).subscribe({
      next: (res: ApiResponse<CouponCheckResponse>) => {
        // Recalculate based on current selection
        const originalPrice = this.selectedPeriodPrice();
        let finalPrice = res.data.final_amount; // The API seems to give a final amount directly, which is unusual with period changes. Let's adapt.
        
        // Let's assume the API coupon response is for the base price and we need to apply logic
        // This is a more robust approach if the backend coupon check is simple
        const couponData = res.data;
        let discount = 0;
        if (couponData.type === 1) { // Fixed amount
            discount = couponData.value ?? 0;
        } else if (couponData.type === 2) { // Percentage
            discount = originalPrice * ((couponData.value ?? 0) / 100);
        }
        this.discountAmount.set(discount);

        this.couponValidation.set({ 
          status: 'success', 
          message: `优惠已应用`
        });
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || '优惠码无效');
        this.couponValidation.set({ status: 'error', message: err.error?.message || '校验失败' });
        this.discountAmount.set(0);
      }
    });
  }

  placeOrder(): void {
    const planId = this.plan()?.id;
    const period = this.selectedPeriodKey();
    if (!planId || !period) {
      this.notificationService.showError('请选择一个有效的套餐和周期。');
      return;
    }
    
    this.isPlacingOrder.set(true);
    const payload = {
        plan_id: planId,
        period: period,
        coupon_code: this.couponValidation().status === 'success' ? this.couponCode().trim() : undefined
    };

    this.apiService.createOrder(payload)
      .pipe(finalize(() => this.isPlacingOrder.set(false)))
      .subscribe({
        next: (res) => {
          const tradeNo = res.data;
          if (tradeNo) {
            this.router.navigate(['/app/order-status', tradeNo]);
          } else {
            this.notificationService.showError('创建订单失败，未能获取订单号。');
          }
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || '创建订单时发生错误。');
        }
      });
  }
}
