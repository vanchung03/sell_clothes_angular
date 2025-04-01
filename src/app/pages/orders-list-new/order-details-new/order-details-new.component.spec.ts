import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailsNewComponent } from './order-details-new.component';

describe('OrderDetailsNewComponent', () => {
  let component: OrderDetailsNewComponent;
  let fixture: ComponentFixture<OrderDetailsNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderDetailsNewComponent]
    });
    fixture = TestBed.createComponent(OrderDetailsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
