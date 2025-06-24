import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoildayCalendarComponent } from './hoilday-calendar.component';

describe('HoildayCalendarComponent', () => {
  let component: HoildayCalendarComponent;
  let fixture: ComponentFixture<HoildayCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HoildayCalendarComponent]
    });
    fixture = TestBed.createComponent(HoildayCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
