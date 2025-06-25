import { TestBed } from '@angular/core/testing';

import { PayrollEmployeeService } from './payroll-employee.service';

describe('PayrollEmployeeService', () => {
  let service: PayrollEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayrollEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
