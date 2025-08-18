import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Hours {
  Monday?: string;
  Tuesday?: string;
  Wednesday?: string;
  Thursday?: string;
  Friday?: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  [key: string]: string | undefined;
}

export interface TimelogEntry {
  id?: number;
  project: string;
  hours?: Hours;
  totalhours: number;
  description?: string;
  weekendDate?: string;
  employeeName?: string;
  employeeId?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | string;
}

@Injectable({ providedIn: 'root' })
export class TimelogService {
  private readonly userApiUrl = 'http://localhost:8080/user/timesheet';
  private readonly adminApiUrl = 'http://localhost:8080/admin/timesheet';

  constructor(private http: HttpClient) {}

  getTimelogs(): Observable<TimelogEntry[]> {
    return this.http.get<any>(this.userApiUrl).pipe(
      map(res => Array.isArray(res) ? res : (res?.body ?? []))
    );
  }

  addTimelog(entry: TimelogEntry): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.userApiUrl, entry, { observe: 'response' });
  }

  updateTimesheetStatus(id: number, status: 'Approved' | 'Rejected'): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/updateStatus/${id}`, { status });
  }
}
