import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { WorkService } from '../work.service';

@Component({
  selector: 'app-workhours',
  templateUrl: './workhours.component.html',
  styleUrls: ['./workhours.component.css']
})
export class WorkhoursComponent implements AfterViewInit {
  pieChart: Chart | undefined;
  barChart: Chart | undefined;
  showChart = true;
  chartData: any;

  constructor(private http: HttpClient, private project:WorkService) {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    if (this.showChart) {
      this.http.get<any>('assets/workhours-chart-data.json').subscribe(data => {
        this.chartData = data;
        this.createCharts();
      });
    }
  }

  showAndSpinChart() {
    this.showChart = !this.showChart;
    if (this.showChart) {
      this.http.get<any>('assets/workhours-chart-data.json').subscribe(data => {
        this.chartData = data;
        this.createCharts();
      });
    } else {
      this.destroyCharts();
    }
  }

  createCharts() {
    setTimeout(() => {
      this.createPieChart();
      this.createBarChart();
    }, 0);
  }

  destroyCharts() {
    if (this.pieChart) this.pieChart.destroy();
    if (this.barChart) this.barChart.destroy();
  }

  createPieChart() {
    const canvas = document.getElementById('attendancePieChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotation = 0;
    const rotationPlugin = {
      id: 'rotationPlugin',
      beforeDraw: (chart: any) => {
        rotation += 0.01;
        chart.options.rotation = rotation;
      }
    };

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.chartData.pieData.labels,
        datasets: [{
          data: this.chartData.pieData.values,
          backgroundColor: ['#4caf50', '#9c27b0', '#ffeb3b', '#f44336', '#9e9e9e', '#2196f3']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { animateRotate: true, duration: 1000 },
        plugins: {
          legend: { position: 'right' }
        },
        rotation
      },
      plugins: [rotationPlugin]
    });
  }

  createBarChart() {
    const canvas = document.getElementById('attendanceBarChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.chartData.barData.labels,
        datasets: [{
          label: 'Work Hours',
          data: this.chartData.barData.values,
          backgroundColor: ['#4caf50', '#f44336', '#9c27b0', '#9e9e9e', '#4caf50'],
          barThickness: 20,
          maxBarThickness: 25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, max: 10 }
        }
      }
    });
  }
}
