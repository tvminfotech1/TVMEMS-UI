import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TimelogEntry {
  employeeName: string;
  project: string;
  wfol: boolean;
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
}

@Injectable({
  providedIn: 'root'
})
export class TimelogService {
  private apiUrl = 'http://localhost:3000/timelogs';

  constructor(private http: HttpClient) {}

  getTimelogs(): Observable<TimelogEntry[]> {
    return this.http.get<TimelogEntry[]>(this.apiUrl);
  }

  addTimelog(entry: TimelogEntry): Observable<TimelogEntry> {
    return this.http.post<TimelogEntry>(this.apiUrl, entry);
  }
}