import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobPosting } from '../../goal/interface/job-openingDto';

@Injectable({
  providedIn: 'root',
})
export class MainLayoutService {
  private apiUrl = 'http://localhost:8080/api/hiring/jobs';

  constructor(private http: HttpClient) {}

  postJobPostings(job: JobPosting): Observable<JobPosting> {
    return this.http.post<JobPosting>(this.apiUrl, job);
  }

  getJobPostings(): Observable<JobPosting[]> {
    return this.http.get<JobPosting[]>(this.apiUrl);
  }

  getJobPostingById(id: string | number): Observable<JobPosting> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<JobPosting>(url);
  }

  updateJobPosting(
    id: string | number,
    updates: Partial<JobPosting>
  ): Observable<JobPosting> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<JobPosting>(url, updates);
  }

  deleteJobPosting(id: string | number): Observable<unknown> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url);
  }
}
