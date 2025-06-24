import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginByNumberComponent } from './login-by-number.component';

describe('LoginByNumberComponent', () => {
  let component: LoginByNumberComponent;
  let fixture: ComponentFixture<LoginByNumberComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginByNumberComponent]
    });
    fixture = TestBed.createComponent(LoginByNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
