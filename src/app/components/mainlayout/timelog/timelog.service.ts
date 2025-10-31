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
private readonly adminAllUrl = 'http://localhost:8080/user/timesheet/all';


  constructor(private http: HttpClient) {}
getTimelogs(isAdmin: boolean = false): Observable<TimelogEntry[]> {
  const url = isAdmin ? this.adminAllUrl : this.userApiUrl;
  return this.http.get<any>(url).pipe(
    map(res => {
      console.log('[TimelogService] raw response from', url, res);

    
      if (Array.isArray(res)) return res;
      if (res?.body && Array.isArray(res.body)) return res.body;
      if (res?.data && Array.isArray(res.data)) return res.data;
      const firstArray = Object.values(res || {}).find(v => Array.isArray(v));
      if (firstArray) return firstArray as TimelogEntry[];

      console.warn('[TimelogService] did not find array in response, returning []');
      return [];
    })
  );
}

  addTimelog(entry: TimelogEntry): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.userApiUrl, entry, { observe: 'response' });
  }

  updateTimesheetStatus(id: number, status: 'Approved' | 'Rejected'): Observable<any> {
  return this.http.put<any>(`http://localhost:8080/admin/timesheet/updateStatus/${id}`, { status });
}


}