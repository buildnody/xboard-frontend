import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { KnowledgeArticle } from '../../../../models/api.model';
import { MarkdownViewerComponent } from '../../../../shared/components/markdown-viewer/markdown-viewer.component';

@Component({
  selector: 'app-knowledge-list',
  templateUrl: './knowledge-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MarkdownViewerComponent],
})
export class KnowledgeListComponent implements OnInit {
  private apiService = inject(ApiService);

  private allCategorizedArticles = signal<{ [key: string]: KnowledgeArticle[] }>({});
  loading = signal(true);
  error = signal<string | null>(null);

  selectedArticle = signal<KnowledgeArticle | null>(null);
  modalLoading = signal(false);
  modalError = signal<string | null>(null);
  
  searchTerm = signal('');

  filteredCategorizedArticles = computed(() => {
    const all = this.allCategorizedArticles();
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return all;
    }

    const filtered: { [key: string]: KnowledgeArticle[] } = {};
    for (const category in all) {
      const matchingArticles = all[category].filter(article => 
        article.title.toLowerCase().includes(term)
      );
      
      // Also include category if its name matches
      if (category.toLowerCase().includes(term) && !filtered[category]) {
        filtered[category] = all[category];
      } else if (matchingArticles.length > 0) {
        filtered[category] = matchingArticles;
      }
    }
    return filtered;
  });


  // Helper to use Object.keys in the template
  objectKeys = Object.keys;

  ngOnInit(): void {
    this.apiService.getKnowledgeArticles().subscribe({
      next: (res: any) => {
        const data = res?.data;
        let categorized: { [key: string]: KnowledgeArticle[] } = {};

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          categorized = data;
        } else if (Array.isArray(data) && data.length > 0) {
          categorized['通用文档'] = data; // Fallback category
        }
        
        this.allCategorizedArticles.set(categorized);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('无法加载文档列表');
        this.loading.set(false);
      },
    });
  }

  selectArticle(articleId: number): void {
    this.modalLoading.set(true);
    this.modalError.set(null);
    this.selectedArticle.set(null); 

    this.apiService.getKnowledgeArticle(articleId).subscribe({
      next: (res) => {
        this.selectedArticle.set(res.data);
        this.modalLoading.set(false);
      },
      error: () => {
        this.modalError.set('无法加载文档内容');
        this.modalLoading.set(false);
      }
    });
  }

  closeArticleModal(): void {
    this.selectedArticle.set(null);
    this.modalError.set(null);
  }
}
