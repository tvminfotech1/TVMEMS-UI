import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpcertificateComponent } from './empcertificate.component';

describe('EmpcertificateComponent', () => {
  let component: EmpcertificateComponent;
  let fixture: ComponentFixture<EmpcertificateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpcertificateComponent]
    });
    fixture = TestBed.createComponent(EmpcertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
