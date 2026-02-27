import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Notice, Ticket } from '../../../models/api.model';
import { MarkdownViewerComponent } from '../../../shared/components/markdown-viewer/markdown-viewer.component';
import { UserStateService } from '../../../core/state/user-state.service';
import { ApiService } from '../../../core/services/api.service';
import { TrafficChartComponent } from './traffic-chart/traffic-chart.component';
import { RouterLink } from '@angular/router';
import { FormatBytesPipe } from '../../../shared/pipes/format-bytes.pipe';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, MarkdownViewerComponent, TrafficChartComponent, RouterLink, FormatBytesPipe],
})
export class DashboardComponent {
  public userState = inject(UserStateService);
  private apiService = inject(ApiService);
  private clipboard = navigator.clipboard;

  // Local UI state
  notices = signal<Notice[]>([]);
  loadingNotices = signal(true);
  copySuccess = signal(false);
  showQrCodeModal = signal(false);
  selectedNotice = signal<Notice | null>(null);
  pendingTicketsCount = signal(0);

  // Computed values derived from the state service
  userInfo = this.userState.combinedData;
  currentPlan = this.userState.currentPlan;

  usedData = computed(() => (this.userInfo()?.u ?? 0) + (this.userInfo()?.d ?? 0));
  totalData = computed(() => this.userInfo()?.transfer_enable ?? 0);
  
  qrCodeData = computed(() => {
    const url = this.userInfo()?.subscribe_url;
    return url ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=256x256&qzone=1` : null;
  });

  truncatedSubscribeUrl = computed(() => {
    const url = this.userInfo()?.subscribe_url;
    if (!url) return '订阅链接生成中...';
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const token = pathParts.pop() || '';
        
        if (token.length > 16) {
            const truncatedToken = `...${token.slice(-12)}`;
            return `${urlObj.origin}${pathParts.join('/')}/${truncatedToken}`;
        }
    } catch (e) {
        if (url.length > 40) {
            return `${url.substring(0, 25)}...${url.substring(url.length - 10)}`;
        }
    }
    return url;
  });

  encodedSubscribeUrl = computed(() => {
    const url = this.userInfo()?.subscribe_url;
    return url ? encodeURIComponent(url) : null;
  });

  base64SubscribeUrl = computed(() => {
    const url = this.userInfo()?.subscribe_url;
    if (!url) return null;
    try {
      return btoa(url);
    } catch (e) {
      console.error("Failed to Base64 encode URL:", e);
      return null;
    }
  });

  constructor() {
    this.loadNotices();
    this.loadTickets();
  }
  
  loadNotices(): void {
    this.loadingNotices.set(true);
    this.apiService.getNotices().subscribe({
      next: (res) => {
        const transformedNotices = res.data.map(notice => ({
          ...notice,
          created_at: Number(notice.created_at) * 1000
        }));
        this.notices.set(transformedNotices);
        this.loadingNotices.set(false);
      },
      error: () => {
        this.notices.set([]);
        this.loadingNotices.set(false);
      }
    });
  }
  
  loadTickets(): void {
    this.apiService.getTickets().subscribe({
      next: (res) => {
        // An "unfinished" ticket is any ticket that is not closed (status: 0).
        const pendingCount = res.data.filter((ticket: Ticket) => ticket.status === 0).length;
        this.pendingTicketsCount.set(pendingCount);
      },
      error: (err) => {
        // Silently fail, as this is not critical dashboard info
        console.error('Failed to load tickets for dashboard:', err);
      }
    });
  }

  copySubscriptionUrl(): void {
    const url = this.userInfo()?.subscribe_url;
    if (url) {
        this.clipboard.writeText(url).then(() => {
            this.copySuccess.set(true);
            setTimeout(() => this.copySuccess.set(false), 2000);
        });
    }
  }

  openNoticeModal(notice: Notice): void {
    this.selectedNotice.set(notice);
  }

  closeNoticeModal(): void {
    this.selectedNotice.set(null);
  }

  getSubtitle(content: string): string {
    if (!content) return '';
    const firstLine = content.split('\n')[0];
    return firstLine.replace(/^[#*-\s]*/, '').trim();
  }
}
