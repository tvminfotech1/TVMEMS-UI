import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/core/constant/constant';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) {}

  getUserById(employeeId: number): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/user/payrole/${employeeId}`);
  }
}
