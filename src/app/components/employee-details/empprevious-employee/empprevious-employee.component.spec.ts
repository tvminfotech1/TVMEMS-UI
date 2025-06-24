import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmppreviousEmployeeComponent } from './empprevious-employee.component';

describe('EmppreviousEmployeeComponent', () => {
  let component: EmppreviousEmployeeComponent;
  let fixture: ComponentFixture<EmppreviousEmployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmppreviousEmployeeComponent]
    });
    fixture = TestBed.createComponent(EmppreviousEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
