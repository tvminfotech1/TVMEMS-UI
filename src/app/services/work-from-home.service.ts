import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkFromHomeService {
  private baseUrl = 'http://localhost:8080/WFH';

  constructor(private http: HttpClient) {}

  getWfhRequestsByMonth(year: number, month: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/all?year=${year}&month=${month + 1}`);
  }

  updateWfhStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/updateStatus/${id}`, { status });
  }

  createWfhRequest(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, request);
  }

  getRequestById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/requests/${id}`);
  }
}
