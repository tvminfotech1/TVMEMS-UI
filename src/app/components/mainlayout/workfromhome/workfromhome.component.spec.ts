import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkfromhomeComponent } from './workfromhome.component';

describe('WorkfromhomeComponent', () => {
  let component: WorkfromhomeComponent;
  let fixture: ComponentFixture<WorkfromhomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkfromhomeComponent]
    });
    fixture = TestBed.createComponent(WorkfromhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
