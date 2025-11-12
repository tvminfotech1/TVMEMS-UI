import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPayslipComponent } from './user-payslip.component';

describe('UserPayslipComponent', () => {
  let component: UserPayslipComponent;
  let fixture: ComponentFixture<UserPayslipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserPayslipComponent]
    });
    fixture = TestBed.createComponent(UserPayslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
