import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhApplyFormComponent } from './wfh-apply-form.component';

describe('WfhApplyFormComponent', () => {
  let component: WfhApplyFormComponent;
  let fixture: ComponentFixture<WfhApplyFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WfhApplyFormComponent]
    });
    fixture = TestBed.createComponent(WfhApplyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
