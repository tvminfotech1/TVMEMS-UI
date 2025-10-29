import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserlistService {

  private baseUrl = 'http://localhost:8080/userlist';

  constructor(private http:HttpClient,private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No valid auth token found. Please log in again.');
      }
      return new HttpHeaders({ Authorization: `Bearer ${token} `});
    }

    getAllUser():Observable<any>{
      return this.http.get(
        `${this.baseUrl}/all`,
        {headers:
          this.getAuthHeaders(),observe:'response'}
      );
    }

    deleteUser(employeeId: number): Observable<any> {
      console.log(`Deleting user from: ${this.baseUrl}/delete/${employeeId}`);
    return this.http.delete(`${this.baseUrl}/delete/${employeeId}`, {
      headers: this.getAuthHeaders(),
      observe: 'response'
    });
  }

}