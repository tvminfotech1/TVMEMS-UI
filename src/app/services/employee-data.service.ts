import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDataService {
  private employeeSource = new BehaviorSubject<any>(null);
  currentEmployee$ = this.employeeSource.asObservable();

  /**
   * Save the current employee details in memory
   */
  setEmployeeData(data: any): void {
    this.employeeSource.next(data);
  }

  /**
   * Synchronously get the current employee details
   * (returns null if nothing has been set yet)
   */
  getEmployeeData(): any {
    return this.employeeSource.getValue();
  }
}
