import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalaryHistory } from '../models/salaryHistory';
import { BASE_URL } from '../models/baseurl/constant';

@Injectable({
  providedIn: 'root',
})
export class SalaryHistoryService {

  constructor(private http: HttpClient) {}

  getAllSalaryHistory(): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/api/salaryHistory`);
  }

  getSalaryByEmployeeAndMonth(
    empId: number,
    month: string
  ): Observable<SalaryHistory[]> {
    return this.http.get<SalaryHistory[]>(
      `${BASE_URL}/api/salaryHistory?id=${empId}&month=${month}`
    );
  }
  getSalaryByEmployeeId(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/api/salaryHistory/employee/${employeeId}`);
  }
  addSalaryHistory(data: SalaryHistory): Observable<SalaryHistory> {
    return this.http.post<SalaryHistory>(`${BASE_URL}/api/salaryHistory`, data);
  }

  updateSalaryHistory(
    id: number,
    data: SalaryHistory
  ): Observable<SalaryHistory> {
    return this.http.put<SalaryHistory>(`${BASE_URL}/api/salaryHistory/${id}`, data);
  }
  
  downloadSalarySlip(id: number, month: string): Observable<any> {
    return this.http.get(`${BASE_URL}/api/salaryHistory/generate-payslip/${id}`, {
      params: { month },
      responseType: 'blob',
    });
  }

  getJoiningDate(id: number): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}/api/employeePayRole/joiningDate/${id}`
    );
  }
  

  deleteSalaryBySalaryId(salaryId: string) {
  return this.http.delete<any>(`${BASE_URL}/api/salaryHistory/${salaryId}`);
}

}
