import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OkrComponent } from './okr.component';

describe('OkrComponent', () => {
  let component: OkrComponent;
  let fixture: ComponentFixture<OkrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OkrComponent]
    });
    fixture = TestBed.createComponent(OkrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
