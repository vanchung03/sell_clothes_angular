import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExcelProductVariantComponent } from './add-excel-product-variant.component';

describe('AddExcelProductVariantComponent', () => {
  let component: AddExcelProductVariantComponent;
  let fixture: ComponentFixture<AddExcelProductVariantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExcelProductVariantComponent]
    });
    fixture = TestBed.createComponent(AddExcelProductVariantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
