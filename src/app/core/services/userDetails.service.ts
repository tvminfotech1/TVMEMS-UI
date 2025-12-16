import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constant/constant';

@Injectable({
  providedIn: 'root',
})
export class UserDetailsService {

  constructor(private http: HttpClient) {}

  getformData(): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${BASE_URL}/userDetails`, { headers });
  }
}
