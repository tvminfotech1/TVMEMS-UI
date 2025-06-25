import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDataService {
  private employeeSource = new BehaviorSubject<any>(null);
  currentEmployee$ = this.employeeSource.asObservable();

  setEmployeeData(data: any) {
    this.employeeSource.next(data);
  }

  getEmployeeData() {
    return this.employeeSource.getValue(); // For synchronous access
  }
}
