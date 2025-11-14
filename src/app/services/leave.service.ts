import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export interface newLeaveRequest {
  id?: number;
  employeeId?: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  totalDays: number;
  duration?: string;
  user?: { employeeId: number };
}

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private apiUrl = 'http://localhost:8080/api/leave-requests';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }
  updateLeaveStatus(
    id: number,
    status: 'APPROVED' | 'REJECTED'
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/admin/${id}/status?status=${status}`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  getAllLeaveRequests(): Observable<newLeaveRequest[]> {
    return this.http.get<newLeaveRequest[]>(`${this.apiUrl}/leaves`, {
      headers: this.getAuthHeaders(),
    });
  }

  getMyLeaveRequests(): Observable<newLeaveRequest[]> {
    return this.http.get<newLeaveRequest[]>(`${this.apiUrl}/my-leaves`, {
      headers: this.getAuthHeaders(),
    });
  }

  getLeaveTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/leavetype`, {
      headers: this.getAuthHeaders(),
    });
  }

  createLeaveRequest(
    leaveRequest: newLeaveRequest
  ): Observable<newLeaveRequest> {
    return this.http.post<newLeaveRequest>(
      `${this.apiUrl}/leaves`,
      leaveRequest,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  applyLeaveForUser(leaveRequest: newLeaveRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/apply`, leaveRequest, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteLeaveRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
