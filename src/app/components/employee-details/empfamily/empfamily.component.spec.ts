import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpfamilyComponent } from './empfamily.component';

describe('EmpfamilyComponent', () => {
  let component: EmpfamilyComponent;
  let fixture: ComponentFixture<EmpfamilyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpfamilyComponent]
    });
    fixture = TestBed.createComponent(EmpfamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
