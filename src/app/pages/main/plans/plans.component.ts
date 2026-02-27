import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Plan } from '../../../models/api.model';
import { MarkdownViewerComponent } from '../../../shared/components/markdown-viewer/markdown-viewer.component';
import { CardSkeletonComponent } from '../../../shared/components/skeleton/card-skeleton.component';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MarkdownViewerComponent, CardSkeletonComponent, RouterLink],
})
export class PlansComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  plans = signal<Plan[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  filterType = signal<'all' | 'period' | 'traffic'>('all');

  filteredPlans = computed(() => {
    const allPlans = this.plans();
    const filter = this.filterType();

    if (filter === 'all') {
      return allPlans;
    }

    if (filter === 'period') {
      return allPlans.filter(p => this.isPeriodic(p));
    }
    
    if (filter === 'traffic') {
      return allPlans.filter(p => !this.isPeriodic(p));
    }

    return allPlans;
  });

  ngOnInit(): void {
    this.apiService.getPlans().subscribe({
      next: res => {
        this.plans.set(res.data.filter(p => p.show));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('无法加载套餐计划');
        this.loading.set(false);
      }
    });
  }

  setFilter(type: 'all' | 'period' | 'traffic'): void {
    this.filterType.set(type);
  }

  isPeriodic(p: Plan): boolean {
    return p.month_price != null || 
           p.quarter_price != null || 
           p.half_year_price != null || 
           p.year_price != null || 
           p.two_year_price != null || 
           p.three_year_price != null;
  }
}