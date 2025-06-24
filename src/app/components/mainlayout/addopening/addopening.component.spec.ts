import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddopeningComponent } from './addopening.component';

describe('AddopeningComponent', () => {
  let component: AddopeningComponent;
  let fixture: ComponentFixture<AddopeningComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddopeningComponent]
    });
    fixture = TestBed.createComponent(AddopeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
