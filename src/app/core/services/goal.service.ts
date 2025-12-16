import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/core/constant/constant';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private baseUrl = `${BASE_URL}/goals`;
  private apiUrl = `${BASE_URL}/allGoals`;

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
    return this.http.get(`${this.baseUrl}/allGoals`);
    return this.http.get(`${this.baseUrl}/allGoals`);
  }

  getGoalByUserid(empId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/allGoals/${empId}`);
  }
}
