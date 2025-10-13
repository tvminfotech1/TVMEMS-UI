import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResingService {

  private apiUrl = 'http://localhost:8080/api/offboarding';

  constructor(private http: HttpClient) {}

  getResignations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getResignationsByEmployeeId(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/${employeeId}`);
  }

  submitResignation(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateResignationStatus(data: any) {
    return this.http.put<any>(`${this.apiUrl}/${data.id}`, data);
  }

  deleteOffboarding(data: any) {
  return this.http.delete<any>(`${this.apiUrl}/${data.id}`);
}

}