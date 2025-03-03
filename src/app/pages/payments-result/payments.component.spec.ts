import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentComponent } from './payments.component';

describe('PaymentsComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentComponent]
    });
    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
