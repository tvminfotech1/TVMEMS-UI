import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlySalarySlipComponent } from './yearly-salary-slip.component';

describe('YearlySalarySlipComponent', () => {
  let component: YearlySalarySlipComponent;
  let fixture: ComponentFixture<YearlySalarySlipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [YearlySalarySlipComponent]
    });
    fixture = TestBed.createComponent(YearlySalarySlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
