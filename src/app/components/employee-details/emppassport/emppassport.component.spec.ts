import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmppassportComponent } from './emppassport.component';

describe('EmppassportComponent', () => {
  let component: EmppassportComponent;
  let fixture: ComponentFixture<EmppassportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmppassportComponent]
    });
    fixture = TestBed.createComponent(EmppassportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
