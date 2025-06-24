import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavDisplayComponent } from './nav-display.component';

describe('NavDisplayComponent', () => {
  let component: NavDisplayComponent;
  let fixture: ComponentFixture<NavDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavDisplayComponent]
    });
    fixture = TestBed.createComponent(NavDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
