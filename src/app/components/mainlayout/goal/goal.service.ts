import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private baseUrl = 'http://localhost:8080/goals';
  private apiUrl = 'http://localhost:8080/goals/user';

  constructor(private http: HttpClient) {}

  getGoals(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  createGoal(goal: any): Observable<any> {
    return this.http.post(this.baseUrl, goal);
  }

  updateGoal(id: number, goal: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, goal);
  }

  deleteGoal(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getAllGoals(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`);
  }

  getGoalByUserid(empId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${empId}`);
  }
}
