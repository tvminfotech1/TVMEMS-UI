import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BASE_URL } from 'src/app/models/baseurl/constant';

export interface WorkFromHome {
  requestId: number;
  employeeId: number;
  employeeEmail: string;
  employeeName: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  approver: string;
  status: string;
  action: string;
}

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
export interface LeaveRequest {
  id?: number;
  employeeId: string;
  fullName?: string;
  startDate: string;  
  endDate: string;    
  status: string;
}


@Injectable({ providedIn: 'root' })
export class TimelogService {
  private readonly userApiUrl = `${BASE_URL}/user/timesheet`;
  private readonly adminAllUrl = `${BASE_URL}/user/timesheet/all`;

  constructor(private http: HttpClient) { }
  getTimelogs(isAdmin: boolean = false): Observable<TimelogEntry[]> {
    const url = isAdmin ? this.adminAllUrl : this.userApiUrl;
    return this.http.get<any>(url).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (res?.body && Array.isArray(res.body)) return res.body;
        if (res?.data && Array.isArray(res.data)) return res.data;
        const firstArray = Object.values(res || {}).find((v) =>
          Array.isArray(v)
        );
        if (firstArray) return firstArray as TimelogEntry[];

        console.warn(
          '[TimelogService] did not find array in response, returning []'
        );
        return [];
      })
    );
  }

  addTimelog(entry: TimelogEntry): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.userApiUrl, entry, { observe: 'response' });
  }

  updateTimesheetStatus(
    id: number,
    status: 'Approved' | 'Rejected'
  ): Observable<any> {
    return this.http.put<any>(
      `${BASE_URL}/admin/timesheet/updateStatus/${id}`,
      { status }
    );
  }

  getApprovedWFHByEmployee(employeeId: number): Observable<WorkFromHome[]> {
    const url = `${BASE_URL}/WFH/approved/${employeeId}`;
    return this.http.get<WorkFromHome[]>(url);
  }
  getApprovedLeavesByEmployee(employeeId: number, weekStart: string, weekEnd: string): Observable<LeaveRequest[]> {
    const url = `${BASE_URL}/leave/approved/${employeeId}`;
    const params = new HttpParams().set('start', weekStart).set('end', weekEnd);
    return this.http.get<LeaveRequest[]>(url, { params });
  }
}