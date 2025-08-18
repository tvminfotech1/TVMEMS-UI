import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaveRequest {
  id?: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  duration?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = 'http://localhost:8080/api/leave-requests';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllLeaveRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  getUserLeaveRequests(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?userId=${userId}`, { headers: this.getAuthHeaders() });
  }

  getLeaveTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/leavetype`, { headers: this.getAuthHeaders() });
  }

createLeaveRequest(leaveRequest: LeaveRequest): Observable<any> {
  return this.http.post(`${this.apiUrl}/leaves`, leaveRequest, { headers: this.getAuthHeaders() });
}


  updateLeaveRequest(id: number, leaveRequest: LeaveRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, leaveRequest, { headers: this.getAuthHeaders() });
  }

  deleteLeaveRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
