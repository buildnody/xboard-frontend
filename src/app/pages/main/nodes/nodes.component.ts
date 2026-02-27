import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { Server } from '../../../models/api.model';

@Component({
  selector: 'app-nodes',
  templateUrl: './nodes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class NodesComponent implements OnInit {
  private apiService = inject(ApiService);

  servers = signal<Server[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.apiService.getServers().subscribe({
      next: (res) => {
        // 修复：移除 .filter(s => s.show)，以显示所有返回的节点
        this.servers.set(res.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('无法加载节点列表');
        this.loading.set(false);
      }
    });
  }

  isServerOnline(server: Server): boolean {
    if (server.is_online !== undefined) {
      return server.is_online === 1 || server.is_online === true;
    }
    
    if (!server.last_check_at) return false;
    const lastCheck = Number(server.last_check_at);
    const now = Math.floor(Date.now() / 1000);
    
    return Math.abs(now - lastCheck) < 600;
  }
}