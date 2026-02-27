import { ChangeDetectionStrategy, Component, SecurityContext, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

declare var markdownit: any;

@Component({
  selector: 'app-markdown-viewer',
  template: `<div class="markdown-body" [innerHTML]="sanitizedContent()"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownViewerComponent {
  content = input.required<string>();
  private sanitizer = inject(DomSanitizer);
  private md: any;

  constructor() {
    // Initialize markdown-it instance. Assumes global markdownit is available from script tag.
    if (typeof markdownit !== 'undefined') {
      this.md = markdownit({
        breaks: true, // Enable GFM-style breaks
      });
    } else {
      console.error('markdown-it library is not loaded. Using fallback.');
      // Provide a fallback that just returns the text to avoid crashing.
      this.md = { render: (text: string) => text };
    }
  }

  sanitizedContent = computed(() => {
    const rawContent = this.content();
    if (!rawContent) {
      return '';
    }
    const htmlString = this.md.render(rawContent);
    const sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, htmlString);
    return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml || '');
  });
}
