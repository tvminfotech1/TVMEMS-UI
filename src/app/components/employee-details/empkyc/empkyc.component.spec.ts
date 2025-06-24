import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpkycComponent } from './empkyc.component';

describe('EmpkycComponent', () => {
  let component: EmpkycComponent;
  let fixture: ComponentFixture<EmpkycComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpkycComponent]
    });
    fixture = TestBed.createComponent(EmpkycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
