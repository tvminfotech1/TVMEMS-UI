import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetViewComponent } from './time-sheet-view.component';

describe('TimeSheetViewComponent', () => {
  let component: TimeSheetViewComponent;
  let fixture: ComponentFixture<TimeSheetViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeSheetViewComponent]
    });
    fixture = TestBed.createComponent(TimeSheetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
