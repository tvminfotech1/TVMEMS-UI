import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassportVisaComponent } from './passport-visa.component';

describe('PassportVisaComponent', () => {
  let component: PassportVisaComponent;
  let fixture: ComponentFixture<PassportVisaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PassportVisaComponent]
    });
    fixture = TestBed.createComponent(PassportVisaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
