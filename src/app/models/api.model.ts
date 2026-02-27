export interface ApiResponse<T> {
  data: T;
}

export interface LoginData {
  email: string;
  password?: string;
}

export interface ChangePasswordData {
  old_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

export interface RegisterData extends LoginData {
  invite_code?: string;
  password_confirmation: string;
  email_code: string;
}

export interface ResetPasswordData {
  email: string;
  email_code: string;
  password?: string;
  password_confirmation?: string;
}

export interface UserInfo {
  id: number; // Add user ID
  email: string;
  transfer_enable: number;
  u: number;
  d: number;
  plan_id: number;
  uuid: string; // <--- 必须添加这一行，对应 API 返回的真实数据
  expired_at: number | null;
  plan?: Plan;
  subscribe_url: string | null;
  invite_code: string | null;
  avatar_url?: string; // 对应 API 中的头像字段
  balance: number;
  commission_balance: number;
}

export interface Notice {
    id: number;
    title: string;
    content: string;
    created_at: number;
}

export interface Plan {
  id: number;
  name: string;
  content: string;
  transfer_enable: number;
  price: number;
  month_price?: number;
  quarter_price?: number;
  half_year_price?: number;
  year_price?: number;
  two_year_price?: number;
  three_year_price?: number;
  onetime_price?: number;
  reset_price?: number;
  original_price?: number;
  original_month_price?: number;
  show: number;
  renew: number;
}

export interface Order {
  trade_no: string;
  plan_id: number;
  total_amount: number;
  status: 0 | 1 | 2 | 3; // 0:待支付, 1:已支付, 2:已取消, 3:已完成
  created_at: number;
  plan: Plan;
  balance_amount?: number;
}

export interface OrderDetail extends Order {
    payment_url?: string;
    qr_code?: string;
    payment_link?: string;
    balance_amount?: number;
    period: string;
}

export interface Server {
  id: number;
  name: string;
  rate: string;
  host: string;
  show: boolean;
  tags: string[];
  last_check_at: number;
  is_online?: 0 | 1 | boolean;
}

export interface InviteCode {
  id: number;
  code: string;
  user_id: number;
  created_at: number;
  updated_at: string;
  invite_count?: number;
}

export interface InviteInfo {
  codes: InviteCode[];
  stat: [number, number, number, number, number];
}

export interface SubscribeInfo {
  u: number;
  d: number;
  subscribe_url: string;
}

export interface SubscribeResponse {
  status: 'success' | 'error';
  data?: SubscribeInfo;
  message?: string;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

// Ticket System Models
export interface TicketMessage {
  id: number;
  ticket_id: number;
  is_me: boolean;
  message: string;
  created_at: number;
  updated_at: number;
}

export interface Ticket {
  id: number;
  subject: string;
  level: 0 | 1 | 2; // 0: Low, 1: Medium, 2: High
  status: 0 | 1; // 0: Open, 1: Closed
  reply_status: 0 | 1; // For status:0 -> 0: Staff Replied, 1: User Waiting
  created_at: number;
  updated_at: number;
  user_id?: number;
  message: string | TicketMessage[];
}

export interface CreateTicketPayload {
  subject: string;
  message: string;
  level: 0 | 1 | 2;
}

export interface TrafficLog {
    record_time: number;
    u: number;
    d: number;
    rate: number;
    total: number;
}

export interface GuestConfigData {
  tos_url: string;
}

export interface CouponCheckResponse {
  type: 1 | 2; // 1 for fixed amount, 2 for percentage
  value: number;
  final_amount: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
  icon?: string;
}

export interface CheckoutResponse {
  payUrl: string;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
}

export interface CommissionLog {
  trade_no: string;
  order_amount: number;
  commission_amount: number;
  commission_status: 0 | 1; // 0: pending, 1: paid
  created_at: number;
}