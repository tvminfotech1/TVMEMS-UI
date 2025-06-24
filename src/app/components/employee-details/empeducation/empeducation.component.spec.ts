import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpeducationComponent } from './empeducation.component';

describe('EmpeducationComponent', () => {
  let component: EmpeducationComponent;
  let fixture: ComponentFixture<EmpeducationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpeducationComponent]
    });
    fixture = TestBed.createComponent(EmpeducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
