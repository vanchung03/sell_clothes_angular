import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleProductsComponent } from './sale-products.component';

describe('SaleProductsComponent', () => {
  let component: SaleProductsComponent;
  let fixture: ComponentFixture<SaleProductsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleProductsComponent]
    });
    fixture = TestBed.createComponent(SaleProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
