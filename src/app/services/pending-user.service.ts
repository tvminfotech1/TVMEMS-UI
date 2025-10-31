import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PendingUserService {
 

  private baseUrl = 'http://localhost:8080/userPending';
  
    constructor(private http: HttpClient, private authService: AuthService) { }

    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        if (!token) {
          throw new Error('No valid auth token found. Please log in again.');
        }
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
      }

    getUserPending(): Observable<any>{
        return this.http.get( 
          `${this.baseUrl}/all`,
          {headers: this.getAuthHeaders(),observe:'response'}
        );
      }

      
}
