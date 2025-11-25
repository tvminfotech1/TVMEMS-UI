import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { AuthService } from './auth.service';
import { BASE_URL } from '../models/baseurl/constant';

@Injectable({
  providedIn: 'root',
})
export class WorkFromHomeService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No valid auth token found. Please log in again.');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getHolidays(): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/Holiday`, {
      headers: this.getAuthHeaders(),
    });
  }

  getWfhAllApprovalRequests(): Observable<any> {
    return this.http.get(`${BASE_URL}/WFH/approvalallrequests`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateWfhStatus(wfh: any): Observable<any> {
    return this.http.put(`${BASE_URL}/WFH/updateStatus/${wfh.requestId}`, wfh, {
      headers: this.getAuthHeaders(),
    });
  }
  getWfhRequestsByMonthAndYear(month: number, year: number): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}/WFH/requests?month=${month}&year=${year}`,
      { headers: this.getAuthHeaders(), observe: 'response' }
    );
  }

  getRequestByMonthAndYear(
    employeeId: number,
    month: number,
    year: number
  ): Observable<any> {
    return this.http.get<any[]>(
      `${BASE_URL}/WFH/userrequests/${employeeId}?month=${month}&year=${year}`,
      { headers: this.getAuthHeaders(), observe: 'response' }
    );
  }

  createWfhRequest(request: any): Observable<any> {
    return this.http.post(`${BASE_URL}/WFH/create`, request, {
      headers: this.getAuthHeaders(),
    });
  }

  getApp_Pen_EmployeeWfh(employeeId: number): Observable<any> {
    return this.http.get(`${BASE_URL}/WFH/employee/${employeeId}`)
  }
}
