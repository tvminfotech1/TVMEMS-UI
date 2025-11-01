import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOpeningListComponent } from './job-opening-list.component';

describe('JobOpeningListComponent', () => {
  let component: JobOpeningListComponent;
  let fixture: ComponentFixture<JobOpeningListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobOpeningListComponent]
    });
    fixture = TestBed.createComponent(JobOpeningListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
