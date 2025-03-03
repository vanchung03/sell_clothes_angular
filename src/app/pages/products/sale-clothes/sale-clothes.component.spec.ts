import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleClothesComponent } from './sale-clothes.component';

describe('SaleClothesComponent', () => {
  let component: SaleClothesComponent;
  let fixture: ComponentFixture<SaleClothesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleClothesComponent]
    });
    fixture = TestBed.createComponent(SaleClothesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
