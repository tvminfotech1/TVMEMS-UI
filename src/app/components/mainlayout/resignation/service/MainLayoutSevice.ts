import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { JobPosting } from '../../goal/interface/job-openingDto';


@Injectable({
  providedIn: 'root',
})
export class MainLayoutService {
  private apiUrl = 'http://localhost:8080/api/hiring/jobs';
 private apiUrl1 ='';
  constructor(private http: HttpClient) {}

  postJobPostings(job: JobPosting): Observable<JobPosting> {
    return this.http.post<JobPosting>(this.apiUrl, job);
  }

  getJobPosting(): Observable<any>{
    return this.http.get<any>(this.apiUrl);
  }

  updateJobPosting(job: any): Observable<any> {
    return this.http.put<any>(this.apiUrl+`/${job.id}`, job);
  }

  deleteJobPosting(jobPostId: any): Observable<any> {
    return this.http.delete<any>(this.apiUrl+`/${jobPostId}`);
  }
}
