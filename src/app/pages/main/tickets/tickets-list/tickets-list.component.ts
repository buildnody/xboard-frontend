import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Ticket } from '../../../../models/api.model';
import { ConfirmActionModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

interface TicketViewModel extends Ticket {
  statusText: string;
  statusClass: string;
  levelText: string;
  levelClass: string;
}

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, DatePipe, ReactiveFormsModule, ConfirmActionModalComponent],
})
export class TicketsListComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  // FIX: Use new FormBuilder() as inject() seems to have inference issues in this environment.
  private fb = new FormBuilder();
  
  tickets = signal<TicketViewModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  closingTicketId = signal<number | null>(null);

  // Modal States
  showCreateModal = signal(false);
  showConfirmationModal = signal(false);
  ticketToClose = signal<TicketViewModel | null>(null);

  // Create Ticket Form State
  isCreatingTicket = signal(false);
  createTicketError = signal<string | null>(null);
  
  createTicketForm = this.fb.group({
    subject: ['', Validators.required],
    message: ['', Validators.required],
    level: [0 as 0 | 1 | 2, Validators.required],
  });

  // An open ticket is one that has not been closed (status: 0).
  openTicket = computed(() => 
    this.tickets().find(t => t.status === 0)
  );

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);
    this.apiService.getTickets().subscribe({
      next: (res) => {
        const mappedTickets = res.data.map((ticket): TicketViewModel => {
          const statusInfo = this.getTicketStatus(ticket);
          const levelInfo = this.getTicketLevel(ticket.level);
          return {
            ...ticket,
            created_at: ticket.created_at * 1000,
            updated_at: ticket.updated_at * 1000,
            statusText: statusInfo.text,
            statusClass: statusInfo.class,
            levelText: levelInfo.text,
            levelClass: levelInfo.class,
          };
        });
        this.tickets.set(mappedTickets.sort((a, b) => b.updated_at - a.updated_at));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || '无法加载工单列表');
        this.loading.set(false);
      },
    });
  }

  handleCreateTicketClick(): void {
    if (this.openTicket()) {
      this.showConfirmationModal.set(true);
    } else {
      this.openCreationForm();
    }
  }

  openCreationForm(): void {
    this.createTicketForm.reset({ level: 0 });
    this.createTicketError.set(null);
    this.showCreateModal.set(true);
  }

  createTicket(): void {
    if (this.createTicketForm.invalid) {
      this.createTicketError.set('主题和内容不能为空。');
      return;
    }
    this.isCreatingTicket.set(true);
    this.createTicketError.set(null);
    
    const formValue = this.createTicketForm.value;
    
    this.apiService.createTicket({
      subject: formValue.subject!,
      message: formValue.message!,
      level: formValue.level!,
    })
    .pipe(finalize(() => this.isCreatingTicket.set(false)))
    .subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.loadTickets();
      },
      error: (err) => {
        this.createTicketError.set(err.error?.message || '创建工单失败，请稍后重试。');
      }
    });
  }

  requestCloseTicket(id: number): void {
    const ticket = this.tickets().find(t => t.id === id);
    if (ticket) {
      this.ticketToClose.set(ticket);
    }
  }

  cancelCloseTicket(): void {
    this.ticketToClose.set(null);
  }

  confirmCloseTicket(): void {
    const ticket = this.ticketToClose();
    if (!ticket) return;

    this.closingTicketId.set(ticket.id);
    this.ticketToClose.set(null); // Close modal immediately

    this.apiService.closeTicket(String(ticket.id))
      .pipe(finalize(() => this.closingTicketId.set(null)))
      .subscribe({
        next: () => {
          this.loadTickets();
        },
        error: (err) => {
          alert('关闭工单失败：' + (err.error?.message || '未知错误'));
        }
      });
  }

  getTicketStatus(ticket: Ticket): { text: string; class: string } {
    if (ticket.status === 1) {
      return { text: '已完结', class: 'bg-gray-500/80' };
    }
    // Now, status must be 0 (Open)
    if (ticket.reply_status === 1) {
      return { text: '待回复', class: 'bg-yellow-500/80' }; // User is waiting for staff
    }
    if (ticket.reply_status === 0) {
      return { text: '已回复', class: 'bg-blue-500/80' };   // Staff has replied
    }
    // Fallback for unexpected states
    return { text: '处理中', class: 'bg-gray-500/80' };
  }

  getTicketLevel(level: number): { text: string; class: string } {
    switch (level) {
      case 0: return { text: '低', class: 'bg-blue-600' };
      case 1: return { text: '中', class: 'bg-orange-500' };
      case 2: return { text: '高', class: 'bg-red-600' };
      default: return { text: '未知', class: 'bg-gray-500' };
    }
  }
}
