import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { KnowledgeArticle } from '../../../../models/api.model';
import { MarkdownViewerComponent } from '../../../../shared/components/markdown-viewer/markdown-viewer.component';

@Component({
  selector: 'app-knowledge-detail',
  templateUrl: './knowledge-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MarkdownViewerComponent, DatePipe],
})
export class KnowledgeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  article = signal<KnowledgeArticle | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('无效的文档 ID');
      this.loading.set(false);
      return;
    }

    this.apiService.getKnowledgeArticle(Number(id)).subscribe({
      next: (res) => {
        this.article.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('无法加载文档内容');
        this.loading.set(false);
      },
    });
  }
}
