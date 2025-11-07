import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/user'; // ✅ your backend base URL

  constructor(private http: HttpClient) {}

  getUserById(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/byid/${employeeId}`);
  }

 

getKycByEmployeeId(employeeId: number) {
  return this.http.get<any>(`http://localhost:8080/kyc/employee/${employeeId}`);
}

}
