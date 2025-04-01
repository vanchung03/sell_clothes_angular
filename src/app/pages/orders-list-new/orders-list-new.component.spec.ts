import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersListNewComponent } from './orders-list-new.component';

describe('OrdersListNewComponent', () => {
  let component: OrdersListNewComponent;
  let fixture: ComponentFixture<OrdersListNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdersListNewComponent]
    });
    fixture = TestBed.createComponent(OrdersListNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
