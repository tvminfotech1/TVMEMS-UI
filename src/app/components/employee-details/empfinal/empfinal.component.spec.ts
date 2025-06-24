import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpfinalComponent } from './empfinal.component';

describe('EmpfinalComponent', () => {
  let component: EmpfinalComponent;
  let fixture: ComponentFixture<EmpfinalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpfinalComponent]
    });
    fixture = TestBed.createComponent(EmpfinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
