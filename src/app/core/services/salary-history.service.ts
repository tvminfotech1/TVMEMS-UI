import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalaryHistory } from '../models/salaryHistory';
import { BASE_URL } from '../constant/constant';

@Injectable({
  providedIn: 'root',
})
export class SalaryHistoryService {

  constructor(private http: HttpClient) {}

  getAllSalaryHistory(): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/salaryHistory`);
  }

  getSalaryByEmployeeAndMonth(
    empId: number,
    month: string
  ): Observable<SalaryHistory[]> {
    return this.http.get<SalaryHistory[]>(
      `${BASE_URL}/salaryHistory?id=${empId}&month=${month}`
    );
  }
  getSalaryByEmployeeId(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/salaryHistory/employee/${employeeId}`);
  }
  addSalaryHistory(data: SalaryHistory): Observable<SalaryHistory> {
    return this.http.post<SalaryHistory>(`${BASE_URL}/salaryHistory`, data);
  }
 
  downloadSalarySlip(id: number, month: string): Observable<any> {
    return this.http.get(`${BASE_URL}/salaryHistory/generate-payslip/${id}`, {
      params: { month },
      responseType: 'blob',
    });
  }

  getJoiningDate(id: number): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}/employeePayRole/joiningDate/${id}`
    );
  }
  

  deleteSalaryBySalaryId(salaryId: string) {
  return this.http.delete<any>(`${BASE_URL}/salaryHistory/${salaryId}`);
}

}
