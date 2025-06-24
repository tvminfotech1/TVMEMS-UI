import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpdocumentComponent } from './empdocument.component';

describe('EmpdocumentComponent', () => {
  let component: EmpdocumentComponent;
  let fixture: ComponentFixture<EmpdocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpdocumentComponent]
    });
    fixture = TestBed.createComponent(EmpdocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
