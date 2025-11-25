import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { JobPosting } from '../../goal/interface/job-openingDto';
import { BASE_URL } from 'src/app/models/baseurl/constant';

@Injectable({
  providedIn: 'root',
})
export class MainLayoutService {
  private apiUrl = `${BASE_URL}/api/hiring/jobs`;
  constructor(private http: HttpClient) {}

  postJobPostings(job: JobPosting): Observable<JobPosting> {
    return this.http.post<JobPosting>(this.apiUrl, job);
  }

  getJobPosting(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateJobPosting(job: any): Observable<any> {
    return this.http.put<any>(this.apiUrl + `/${job.id}`, job);
  }

  deleteJobPosting(jobPostId: any): Observable<any> {
    return this.http.delete<any>(this.apiUrl + `/${jobPostId}`);
  }
}
