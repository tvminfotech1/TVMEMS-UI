import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousEmploymentComponent } from './previous-employment.component';

describe('PreviousEmploymentComponent', () => {
  let component: PreviousEmploymentComponent;
  let fixture: ComponentFixture<PreviousEmploymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreviousEmploymentComponent]
    });
    fixture = TestBed.createComponent(PreviousEmploymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
