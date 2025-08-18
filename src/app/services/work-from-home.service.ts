import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WorkFromHomeService {
  private baseUrl = 'http://localhost:8080/WFH';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No valid auth token found. Please log in again.');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getWfhRequestsByMonth(year: number, month: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/all?year=${year}&month=${month + 1}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateWfhStatus(id: number, status: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/updateStatus/${id}`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }

  createWfhRequest(request: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/create`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  getRequestById(id: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/requests/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
