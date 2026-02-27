import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  host: {
    '(document:click)': 'onUserActivity()',
    '(document:keypress)': 'onUserActivity()',
  }
})
export class LayoutComponent {
  isSidebarOpen = signal(false);
  private authService = inject(AuthService);

  onUserActivity() {
    this.authService.recordActivity();
  }

  navLinks = [
    { path: 'dashboard', name: '仪表盘', icon: 'M9 17v-2a4 4 0 00-4-4H3V9a4 4 0 004 4h2v2m0 0V9m0 8h2a4 4 0 004-4V9a4 4 0 00-4-4H9' },
    { path: 'knowledge', name: '使用文档', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { path: 'tools', name: '工具下载', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12l-4.5 4.5m0 0l-4.5-4.5m4.5 4.5V3' },
    { path: 'nodes', name: '节点列表', icon: 'M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122' },
    { path: 'plans', name: '订阅计划', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: 'orders', name: '我的订单', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { path: 'tickets', name: '我的工单', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' },
    { path: 'invites', name: '我的邀请', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.72a3 3 0 00-4.682 2.72 9.094 9.094 0 003.741.479m7.5-2.72a3 3 0 01-7.5 0m7.5 0a3 3 0 00-7.5 0M12 12.75a3 3 0 01-7.5 0m7.5 0a3 3 0 00-7.5 0M12 12.75a3 3 0 01-7.5 0m7.5 0a3 3 0 00-7.5 0M12 6.75a3 3 0 00-3 3h6a3 3 0 00-3-3z' },
    { path: 'community', name: '社区中心', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.781-4.121M12 12a3 3 0 100-6 3 3 0 000 6z' },
    { path: 'traffic-log', name: '流量明细', icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z' },
    { path: 'profile', name: '个人中心', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  ];
}
