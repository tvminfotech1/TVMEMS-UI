import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresumeComponent } from './empresume.component';

describe('EmpresumeComponent', () => {
  let component: EmpresumeComponent;
  let fixture: ComponentFixture<EmpresumeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpresumeComponent]
    });
    fixture = TestBed.createComponent(EmpresumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
