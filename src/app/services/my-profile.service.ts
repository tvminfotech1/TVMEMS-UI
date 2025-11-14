import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MyProfileService {
  private apiUrl = 'http://localhost:8080/documents';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No valid auth token found. Please log in again.');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getUserPhoto(employeeId: number): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/photo/${employeeId}`, {
      responseType: 'text',
      headers,
    });
  }
}
