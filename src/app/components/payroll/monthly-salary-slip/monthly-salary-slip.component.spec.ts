import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlySalarySlipComponent } from './monthly-salary-slip.component';

describe('MonthlySalarySlipComponent', () => {
  let component: MonthlySalarySlipComponent;
  let fixture: ComponentFixture<MonthlySalarySlipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlySalarySlipComponent]
    });
    fixture = TestBed.createComponent(MonthlySalarySlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
