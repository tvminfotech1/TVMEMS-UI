import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Observer, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WorkFromHomeService {
  
  private baseUrl = 'http://localhost:8080/WFH';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No valid auth token found. Please log in again.');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getWfhRequestsByMonth(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/all`,
      { headers: this.getAuthHeaders() }
    );  
  }

  getWfhRequests(): Observable<any>{
    return this.http.get(
      `${this.baseUrl}/all`,
      {headers: this.getAuthHeaders()}
    )
  }
  //admin

  // original
  // updateWfhStatus(id: number, status: string): Observable<any> {
  //   return this.http.put(
  //     ${this.baseUrl}/updateStatus/${id},
  //     { status },
  //     { headers: this.getAuthHeaders() }
  //   );
  // }

  updateWfhStatus(wfh: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/updateStatus/${wfh.requestId}`, 
      wfh, 
      { headers: this.getAuthHeaders() } 
    );
  }
getWfhRequestsByMonthAndYear(month: number, year: number): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/requests?month=${month}&year=${year}`,
    { headers: this.getAuthHeaders(), observe: 'response' }
  );
}


getRequestByMonthAndYear(employeeId: number, month: number, year: number): Observable<any> {
  return this.http.get<any[]>(
    `${this.baseUrl}/userrequests/${employeeId}?month=${month}&year=${year}`,
        { headers: this.getAuthHeaders(), observe: 'response' }

  );
}


  createWfhRequest(request: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/create`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

    getRequestById(employeeId: any): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/requests/${employeeId}`,
      { headers: this.getAuthHeaders() }
    );
  }
  //user only
}