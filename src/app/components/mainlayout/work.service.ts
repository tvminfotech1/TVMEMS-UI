import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkService {
  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    return this.http.get<any>('assets/work-data.json').pipe(
      map(data => data.user)
    );
  }

  getProjects(): Observable<any[]> {
    return this.http.get<any>('assets/work-data.json').pipe(
      map(data => data.projects)
    );
  }
}
