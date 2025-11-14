import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeDataService {
  private employeeSource = new BehaviorSubject<any>(null);
  currentEmployee$ = this.employeeSource.asObservable();

  setEmployeeData(data: any): void {
    this.employeeSource.next(data);
  }

  getEmployeeData(): any {
    return this.employeeSource.getValue();
  }
}
