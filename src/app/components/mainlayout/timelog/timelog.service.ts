import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TimelogEntry {
  project: string;
  hours: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
  };
  totalHours: string;
  description: string;
  weekendDate: string;
  employeeName?: string; 
  employeeId?: string;  
}

@Injectable({
  providedIn: 'root'
})
export class TimelogService {
  private apiUrl = 'http://localhost:8080/user/timesheet';

  constructor(private http: HttpClient) {}

  
  getTimelogs(): Observable<any> {
  return this.http.get<any>(this.apiUrl);
}


  // ❗ Accepting `any` because we're sending different payload to backend
  addTimelog(entry: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.apiUrl, entry, {
      observe: 'response'
    });
  }
}
