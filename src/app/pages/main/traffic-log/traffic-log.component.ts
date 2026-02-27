import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { TrafficLog } from '../../../models/api.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormatBytesPipe } from '../../../shared/pipes/format-bytes.pipe';

@Component({
  selector: 'app-traffic-log',
  templateUrl: './traffic-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, LoadingSpinnerComponent, ErrorMessageComponent, EmptyStateComponent, FormatBytesPipe],
})
export class TrafficLogComponent implements OnInit {
  private apiService = inject(ApiService);

  logs = signal<TrafficLog[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private parseNumeric(value: any): number {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  ngOnInit(): void {
    this.loadLogs();
  }
  
  loadLogs(): void {
    this.loading.set(true);
    this.error.set(null);
    this.apiService.getTrafficLog().subscribe({
      next: (res) => {
        // API response shape: { d, u, record_at, server_rate }
        // Component's TrafficLog model expects: { d, u, record_time, rate, total }
        // We must map the data to the expected shape.
        const rawLogs: any[] = res.data || [];
        const processedLogs = rawLogs.map(log => {
          const u = this.parseNumeric(log.u);
          const d = this.parseNumeric(log.d);
          const rate = this.parseNumeric(log.server_rate);

          const newLog: TrafficLog = {
            record_time: this.parseNumeric(log.record_at),
            u: u,
            d: d,
            rate: rate,
            total: (u + d) * rate, // Calculate total based on business logic
          };
          return newLog;
        }).sort((a, b) => b.record_time - a.record_time);
        
        this.logs.set(processedLogs);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || '无法加载流量明细');
        this.loading.set(false);
      },
    });
  }
}
