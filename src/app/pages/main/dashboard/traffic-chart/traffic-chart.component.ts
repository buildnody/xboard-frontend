import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, input, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var Chart: any;

@Component({
  selector: 'app-traffic-chart',
  template: `
    <div class="relative w-full h-full flex items-center justify-center">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class TrafficChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Inputs
  totalData = input.required<number>();
  usedData = input.required<number>();

  private chart: any;

  constructor() {
    effect(() => {
      // Re-render chart if input data changes
      if (this.chart) {
        this.updateChartData();
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded.');
      return;
    }
    this.createChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
  
  private updateChartData(): void {
    const remainingData = Math.max(0, this.totalData() - this.usedData());
    this.chart.data.datasets[0].data = [this.usedData(), remainingData];
    
    const usedFormatted = this.formatBytes(this.usedData());
    const totalFormatted = this.formatBytes(this.totalData());
    this.chart.options.plugins.tooltip.callbacks.label = (context: any) => {
      const label = context.dataset.label || '';
      if (label) {
        return `${label}: ${this.formatBytes(context.raw)}`;
      }
      return this.formatBytes(context.raw);
    };
    this.chart.options.plugins.title.text = `${usedFormatted} / ${totalFormatted}`;

    this.chart.update();
  }

  private createChart(): void {
    const isLightTheme = document.documentElement.classList.contains('light');
    const textColor = isLightTheme ? '#4B5563' : '#A0AEC0';

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['已用流量', '剩余流量'],
        datasets: [{
          data: [],
          backgroundColor: [
            '#8B5CF6', // accent-end
            '#374151'  // gray-700 for dark bg
          ],
          borderColor: isLightTheme ? '#F3F4F6' : '#2D3748', // surface color
          borderWidth: 5,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 20,
              font: { size: 14 }
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {}
          },
          title: {
            display: true,
            text: '',
            color: textColor,
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
                top: 10,
                bottom: 10
            }
          }
        }
      }
    });

    this.updateChartData();
  }
}
