import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/models/baseurl/constant';

@Injectable({
  providedIn: 'root',
})
export class ResingService {
  private apiUrl = `${BASE_URL}/api/offboarding`;

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

}
