import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrunsComponent } from './payruns.component';

describe('PayrunsComponent', () => {
  let component: PayrunsComponent;
  let fixture: ComponentFixture<PayrunsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrunsComponent]
    });
    fixture = TestBed.createComponent(PayrunsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
