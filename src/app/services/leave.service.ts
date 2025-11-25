import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { BASE_URL } from "../models/baseurl/constant";

export interface UserInfo {
  fullName: string;
  mobile: number;
  email: string;
  aadhar: string;
  dob: string;
  gender: string;
  status: boolean;
  joiningDate: string;
  onboardingCompleted: boolean;
  roles: string[];
  employeeId: number;
}

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
  user?: UserInfo;
}

@Injectable({
  providedIn: "root",
})
export class LeaveService {

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
  }
  updateLeaveStatus(
    id: number,
    status: "APPROVED" | "REJECTED"
  ): Observable<any> {
    return this.http.put(
      `${BASE_URL}/api/leave-requests/admin/${id}/status?status=${status}`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }
  getHolidays(): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/Holiday`, {
      headers: this.getAuthHeaders(),
    });
  }

 getLeaveByEmployeeId(employeeId: number): Observable<any> {
  return this.http.get<any>(
    `${BASE_URL}/api/leave-requests/employee/${employeeId}`,
    { headers: this.getAuthHeaders() }
  );
}

  getAllLeaveRequests(): Observable<newLeaveRequest[]> {
    return this.http.get<newLeaveRequest[]>(`${BASE_URL}/api/leave-requests/leaves`, {
      headers: this.getAuthHeaders(),
    });
  }


  createLeaveRequest(
    leaveRequest: newLeaveRequest
  ): Observable<newLeaveRequest> {
    return this.http.post<newLeaveRequest>(
      `${BASE_URL}/api/leave-requests/leaves`,
      leaveRequest,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  checkLeave(empId: number, date: string): Observable<{ body: boolean }> {
    return this.http.get<{ body: boolean }>(
      `${BASE_URL}/api/leave-requests/check-leave-status/${empId}?date=${date}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
