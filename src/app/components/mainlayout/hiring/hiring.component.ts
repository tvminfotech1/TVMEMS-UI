import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface Job {
  title: string;
  location: string;
  qualifications: string;
  yearOfPassout: string;
  experience: string;
  description: string;
  positions: number;
}

@Component({
  selector: 'app-hiring',
  templateUrl: './hiring.component.html',
  styleUrls: ['./hiring.component.css']
})
export class HiringComponent implements OnInit {
  jobs?: any[] = [];
  loading = false;
  errorMessage: string | null = null;
  expandedIndex: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.loading = true;
    this.errorMessage = null;

    this.http.get<Job[]>('http://localhost:8080/api/hiring/jobs').subscribe({
      next: (data) => {
        console.log(data);
        this.jobs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Job fetch failed:', err);
        this.errorMessage = 'Failed to load jobs. Please try again.';
        this.loading = false;
      }
    });
  }

  toggleDescription(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}
