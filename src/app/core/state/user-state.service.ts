import { Injectable, signal, inject, computed } from '@angular/core';
import { ApiService } from '../services/api.service';
import { UserInfo, SubscribeInfo, Plan } from '../../models/api.model';
import { forkJoin, map, catchError, of, Subject, switchMap, tap, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private apiService = inject(ApiService);
  
  private refreshTrigger = new Subject<void>();

  // Raw State Signals
  private userInfo$ = signal<UserInfo | null>(null);
  private subscription$ = signal<SubscribeInfo | null>(null);
  private allPlans$ = signal<Plan[]>([]);
  
  // Status Signals
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Public Computed Signals for components to use
  public readonly currentUser = this.userInfo$.asReadonly();
  public readonly subscription = this.subscription$.asReadonly();
  public readonly allPlans = this.allPlans$.asReadonly();

  public readonly currentPlan = computed(() => {
    const user = this.userInfo$();
    const plans = this.allPlans$();
    if (!user || !plans) return null;
    return plans.find(p => p.id === user.plan_id);
  });

  public readonly combinedData = computed(() => {
    const user = this.userInfo$();
    const sub = this.subscription$();
    if (!user) return null;

    return {
      ...user,
      u: sub?.u ?? user.u,
      d: sub?.d ?? user.d,
      subscribe_url: sub?.subscribe_url ?? user.subscribe_url
    };
  });
  
  constructor() {
    this.refreshTrigger.pipe(
      startWith(null), // Trigger initial load
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(() => forkJoin({
        userInfoRes: this.apiService.getUserInfo().pipe(catchError(() => of({ data: null }))),
        plansRes: this.apiService.getPlans().pipe(catchError(() => of({ data: [] }))),
        subscribeRes: this.apiService.getSubscribe().pipe(catchError(() => of({ status: 'error', data: null })))
      }))
    ).subscribe(({ userInfoRes, plansRes, subscribeRes }) => {
      if (!userInfoRes.data) {
        this.error.set('无法获取用户核心数据');
        this.loading.set(false);
        return;
      }

      this.userInfo$.set(userInfoRes.data);
      this.allPlans$.set(plansRes.data);
      if (subscribeRes.status === 'success') {
        this.subscription$.set(subscribeRes.data || null);
      }
      
      this.loading.set(false);
    });
  }

  public triggerRefresh(): void {
    this.refreshTrigger.next();
  }
}