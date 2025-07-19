import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Hours {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
}

export interface TimelogEntry {
  id?: number; // Add ID for updating/tracking specific entries
  project: string;
  hours: Hours; // Use the Hours interface
  totalHours: string; // Keep as string for now based on your current totalHours calculation
  description: string;
  weekendDate: string;
  employeeName: string; // Make mandatory if it's always available
  employeeId: string;   // Make mandatory if it's always available
  status?: 'Pending' | 'Approved' | 'Rejected' | string; // NEW: Status field
}

@Injectable({
  providedIn: 'root'
})
export class TimelogService {
  private userApiUrl = 'http://localhost:8080/user/timesheet';
  private adminApiUrl = 'http://localhost:8080/admin/timesheet'; // New API base for admin actions

  constructor(private http: HttpClient) {}

  getTimelogs(): Observable<any> {
    // This API should ideally return all timesheets if user is admin, or only user's if not.
    // Assuming it returns all, and frontend filters based on role/employeeId.
    return this.http.get<any>(this.userApiUrl); // Changed to userApiUrl
  }

  addTimelog(entry: any): Observable<HttpResponse<any>> {
    // Backend should set status to 'Pending' by default for new submissions
    return this.http.post<any>(this.userApiUrl, entry, {
      observe: 'response'
    });
  }

  // --- NEW: Method for Admin to update timesheet status ---
  updateTimesheetStatus(id: number, status: 'Approved' | 'Rejected'): Observable<any> {
    const payload = { status: status };
    return this.http.put(`${this.adminApiUrl}/updateStatus/${id}`, payload);
  }
}