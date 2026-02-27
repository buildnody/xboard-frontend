import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { UserStateService } from '../../../../core/state/user-state.service';
import { Ticket, TicketMessage } from '../../../../models/api.model';

interface ConversationMessage {
  id: number | string;
  message: string;
  created_at: number;
  is_user: boolean;
}

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  public userState = inject(UserStateService);

  ticket = signal<Ticket | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  ticketId = signal<string>('');
  
  // Reply State
  isReplying = signal(false);
  replyMessage = signal('');
  replyError = signal<string | null>(null);
  
  // Close State
  isClosing = signal(false);

  conversation = computed<ConversationMessage[]>(() => {
    const t = this.ticket();

    if (!t) {
        return [];
    }
    
    // The API returns the entire conversation in the `message` field as an array.
    const apiMessages = t.message;
    if (!Array.isArray(apiMessages)) {
      // This path should not be taken in the detail view, but it's a safe fallback.
      return [];
    }

    const messages: ConversationMessage[] = (apiMessages as TicketMessage[]).map(msg => ({
      id: msg.id,
      message: String(msg.message || ''),
      created_at: msg.created_at, // Timestamps are pre-converted in loadTicket()
      is_user: msg.is_me // THE CORRECT WAY: Use the `is_me` boolean directly from the API.
    }));
    
    return messages.sort((a, b) => a.created_at - b.created_at);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('无效的工单 ID');
      this.loading.set(false);
      return;
    }
    this.ticketId.set(id);
    this.loadTicket();
  }

  loadTicket(): void {
    this.loading.set(true);
    this.error.set(null);
    this.apiService.getTicket(this.ticketId()).subscribe({
      next: (res) => {
        const ticketData = res.data;

        if (!ticketData) {
          this.error.set('未找到工单数据。');
          this.loading.set(false);
          return;
        }

        // Convert main ticket timestamps from seconds to milliseconds
        ticketData.created_at *= 1000;
        ticketData.updated_at *= 1000;

        // CRITICAL FIX: Convert timestamps inside the `message` array as well
        if (Array.isArray(ticketData.message)) {
          ticketData.message.forEach((msg: TicketMessage) => {
            if (msg.created_at) {
              msg.created_at *= 1000;
            }
            if (msg.updated_at) {
              msg.updated_at *= 1000;
            }
          });
        }
        
        this.ticket.set(ticketData);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || '无法加载工单详情');
        this.loading.set(false);
      },
    });
  }

  submitReply(): void {
    if (!this.replyMessage().trim()) {
      this.replyError.set('回复内容不能为空。');
      return;
    }
    this.isReplying.set(true);
    this.replyError.set(null);
    this.apiService.replyToTicket({ id: this.ticketId(), message: this.replyMessage() })
      .pipe(finalize(() => this.isReplying.set(false)))
      .subscribe({
        next: () => {
          this.replyMessage.set('');
          this.loadTicket(); // Reload to see the new reply
        },
        error: (err) => {
          this.replyError.set(err.error?.message || '回复失败，请稍后再试。');
        }
      });
  }

  closeTicket(): void {
    if (!confirm('您确定要关闭此工单吗？关闭后将无法再次回复。')) {
      return;
    }
    this.isClosing.set(true);
    this.apiService.closeTicket(this.ticketId())
      .pipe(finalize(() => this.isClosing.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/app/tickets']);
        },
        error: (err) => {
          alert('关闭工单失败: ' + (err.error?.message || '未知错误'));
        }
      });
  }
}