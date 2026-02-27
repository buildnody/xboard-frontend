import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, tap, shareReplay, map } from 'rxjs';
import { ApiResponse, LoginData, RegisterData, Plan, UserInfo, Notice, Order, OrderDetail, Server, ChangePasswordData, InviteCode, InviteInfo, SubscribeResponse, KnowledgeArticle, Ticket, CreateTicketPayload, TrafficLog, GuestConfigData, CouponCheckResponse, PaymentMethod, CheckoutResponse, CommissionLog, PaginatedData, ResetPasswordData } from '../../models/api.model';
import { API_BASE_URL } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http: HttpClient = inject(HttpClient);
  
  private apiUrl = API_BASE_URL;

  // Simple in-memory cache with expiration
  private cache = new Map<string, { expiry: number, observable: Observable<any> }>();

  private getWithCache<T>(key: string, request: Observable<T>, ttlMinutes: number = 5): Observable<T> {
    const now = Date.now();
    const cachedItem = this.cache.get(key);

    if (cachedItem && now < cachedItem.expiry) {
      return cachedItem.observable;
    }
    
    const newObservable = request.pipe(
      shareReplay(1)
    );

    this.cache.set(key, { expiry: now + ttlMinutes * 60 * 1000, observable: newObservable });
    return newObservable;
  }

  // Guest
  getGuestConfig(): Observable<ApiResponse<GuestConfigData>> {
    const timestamp = Date.now();
    return this.http.get<ApiResponse<GuestConfigData>>(`${this.apiUrl}/guest/comm/config?t=${timestamp}`);
  }

  // Auth
  sendEmailVerify(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/passport/comm/sendEmailVerify`, { email });
  }

  login(data: LoginData): Observable<ApiResponse<{ auth_data: string }>> {
    return this.http.post<ApiResponse<{ auth_data: string }>>(`${this.apiUrl}/passport/auth/login`, data);
  }

  register(data: RegisterData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/passport/auth/register`, data);
  }

  resetPassword(data: ResetPasswordData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/passport/auth/forget`, data);
  }

  // User
  getUserInfo(): Observable<ApiResponse<UserInfo>> {
    return this.http.get<ApiResponse<UserInfo>>(`${this.apiUrl}/user/info`);
  }
 
  getSubscribe(): Observable<SubscribeResponse> {
    return this.http.get<SubscribeResponse>(`${this.apiUrl}/user/getSubscribe`);
  }
  
  resetSubscription(): Observable<ApiResponse<any>> {
  const timestamp = Date.now();
  return this.http.get<ApiResponse<any>>(`${this.apiUrl}/user/resetSecurity?t=${timestamp}`);
  }

  changePassword(data: ChangePasswordData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/user/changePassword`, data);
  }

  transferCommission(amountInCents: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/user/transfer`, { transfer_amount: amountInCents });
  }

  // Invitations are removed, but methods are kept in case they are needed later.
  getInvites(): Observable<ApiResponse<InviteInfo>> {
    const cacheBuster = `?_=${new Date().getTime()}`;
    return this.http.get<ApiResponse<InviteInfo>>(`${this.apiUrl}/user/invite/fetch${cacheBuster}`);
  }

  generateInviteCode(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/user/invite/save`);
  }
  
  getTrafficLog(): Observable<ApiResponse<TrafficLog[]>> {
    return this.http.get<ApiResponse<TrafficLog[]>>(`${this.apiUrl}/user/stat/getTrafficLog`);
  }
  
  getCommissionLogs(page: number, pageSize: number): Observable<PaginatedData<any>> {
    const url = `${this.apiUrl}/user/invite/details?current=${page}&page_size=${pageSize}&t=${new Date().getTime()}`;
    return this.http.get<PaginatedData<any>>(url);
  }

  getNotices(): Observable<ApiResponse<Notice[]>> {
    return this.getWithCache('notices', this.http.get<ApiResponse<Notice[]>>(`${this.apiUrl}/user/notice/fetch`));
  }

  getServers(): Observable<ApiResponse<Server[]>> {
    return this.getWithCache('servers', this.http.get<ApiResponse<Server[]>>(`${this.apiUrl}/user/server/fetch`));
  }

  // Knowledge Base
  getKnowledgeArticles(): Observable<ApiResponse<KnowledgeArticle[]>> {
    const languageParam = 'language=zh-CN';
    const request$ = this.http.get<ApiResponse<KnowledgeArticle[]>>(`${this.apiUrl}/user/knowledge/fetch?${languageParam}`);
    return this.getWithCache('knowledge', request$);
  }

  getKnowledgeArticle(id: number): Observable<ApiResponse<KnowledgeArticle>> {
    // Individual articles are not cached as they might be updated.
    return this.http.get<ApiResponse<KnowledgeArticle>>(`${this.apiUrl}/user/knowledge/fetch?id=${id}`);
  }

  // Plans & Payment
  getPlans(): Observable<ApiResponse<Plan[]>> {
    return this.getWithCache('plans', this.http.get<ApiResponse<Plan[]>>(`${this.apiUrl}/user/plan/fetch`));
  }

  checkCoupon(payload: { code: string, plan_id: number }): Observable<ApiResponse<CouponCheckResponse>> {
    return this.http.post<ApiResponse<CouponCheckResponse>>(`${this.apiUrl}/user/coupon/check`, payload);
  }

  createOrder(payload: { plan_id: number, period: string, coupon_code?: string }): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/user/order/save`, payload);
  }

  getOrders(): Observable<ApiResponse<Order[]>> {
      return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/user/order/fetch`);
  }
  
  getOrderDetail(trade_no: string): Observable<ApiResponse<OrderDetail>> {
    return this.http.get<ApiResponse<OrderDetail>>(`${this.apiUrl}/user/order/detail?trade_no=${trade_no}`);
  }

  cancelOrder(trade_no: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/user/order/cancel`, { trade_no });
  }

  getPaymentMethods(trade_no: string): Observable<ApiResponse<PaymentMethod[]>> {
    const url = `${this.apiUrl}/user/order/getPaymentMethod?trade_no=${trade_no}&t=${Date.now()}`;
    // Adapt the response structure from { status, message, data } to the app's expected { data }
    // FIX: Correctly typed the HTTP response to match the actual API output, which includes status/message properties.
    return this.http.get<{ status: unknown; message: unknown; data: PaymentMethod[] }>(url).pipe(
      // FIX: Explicitly type `response` as `any` to prevent incorrect inference to `unknown`.
      map((response: any) => ({ data: response.data || [] }))
    );
  }

  checkout(payload: { trade_no: string; method: number, use_balance?: boolean }): Observable<any> {
    // The working frontend sends data as `application/x-www-form-urlencoded`.
    // Using HttpParams with HttpClient POST achieves this automatically.
    let params = new HttpParams()
      .set('trade_no', payload.trade_no)
      .set('method', String(payload.method));

    if (payload.use_balance) {
      params = params.set('use_balance', '1');
    }

    return this.http.post<any>(`${this.apiUrl}/user/order/checkout`, params);
  }

  // Ticket System
  getTicketConfig(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/user/comm/config`);
  }

  getTickets(): Observable<ApiResponse<Ticket[]>> {
    return this.http.get<ApiResponse<Ticket[]>>(`${this.apiUrl}/user/ticket/fetch`);
  }

  getTicket(id: string): Observable<ApiResponse<Ticket>> {
    return this.http.get<ApiResponse<Ticket>>(`${this.apiUrl}/user/ticket/fetch?id=${id}`);
  }

  createTicket(payload: CreateTicketPayload): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/user/ticket/save`, payload);
  }

  replyToTicket(payload: { id: string; message: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/user/ticket/reply`, payload);
  }

  closeTicket(id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/user/ticket/close`, { id });
  }
}