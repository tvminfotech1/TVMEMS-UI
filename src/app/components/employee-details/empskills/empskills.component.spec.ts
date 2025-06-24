import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpskillsComponent } from './empskills.component';

describe('EmpskillsComponent', () => {
  let component: EmpskillsComponent;
  let fixture: ComponentFixture<EmpskillsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpskillsComponent]
    });
    fixture = TestBed.createComponent(EmpskillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
