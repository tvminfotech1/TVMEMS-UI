import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';



  export interface newLeaveRequest {
  id?: number;
  employeeId?: number;   // ✅ add this line
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
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = 'http://localhost:8080/api/leave-requests';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  updateLeaveStatus(id: number, status: 'APPROVED' | 'REJECTED'): Observable<any> {
    // Send an empty body because your backend only needs query param
    return this.http.put(`${this.apiUrl}/admin/${id}/status?status=${status}`, {}, {
      headers: this.getAuthHeaders()
    });
  }



  /** Get all leave requests (for logged-in user or admin) */
  getAllLeaveRequests(): Observable<newLeaveRequest[]> {
    return this.http.get<newLeaveRequest[]>(`${this.apiUrl}/leaves`, { headers: this.getAuthHeaders() });
  }

  /** Get leave requests for a specific user (for admin) */
  /** Get leave requests for the currently logged-in user */
  getMyLeaveRequests(): Observable<newLeaveRequest[]> {
    return this.http.get<newLeaveRequest[]>(`${this.apiUrl}/my-leaves`, {
      headers: this.getAuthHeaders()
    });
  }


  /** Get all leave types */
  getLeaveTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/leavetype`, { headers: this.getAuthHeaders() });
  }

  /** Create a leave request for self (user) */
  createLeaveRequest(leaveRequest: newLeaveRequest): Observable<newLeaveRequest> {
    console.log(leaveRequest)
    return this.http.post<newLeaveRequest>(`${this.apiUrl}/leaves`, leaveRequest, {
      headers: this.getAuthHeaders()
    });
  }


  /** Apply leave for a specific user (admin) */
  applyLeaveForUser(leaveRequest: newLeaveRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/apply`, leaveRequest, { headers: this.getAuthHeaders() });
  }

  /** Update an existing leave request */
  // updateLeaveRequest now accepts partial updates
  //   updateLeaveRequest(id: string | number, leave: Partial<newLeaveRequest>): Observable<newLeaveRequest> {
  //     return this.http.put<newLeaveRequest>(`${this.apiUrl}/${id}`, leave, { headers: this.getAuthHeaders() })
  //       .pipe(catchError(err => throwError(() => err)));

  // }


  /** Delete a leave request */
  deleteLeaveRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
