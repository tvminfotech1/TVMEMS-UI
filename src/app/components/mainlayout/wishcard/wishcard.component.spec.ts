import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishcardComponent } from './wishcard.component';

describe('WishcardComponent', () => {
  let component: WishcardComponent;
  let fixture: ComponentFixture<WishcardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WishcardComponent]
    });
    fixture = TestBed.createComponent(WishcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
