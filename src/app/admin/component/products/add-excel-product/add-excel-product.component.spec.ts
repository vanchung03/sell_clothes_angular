import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExcelProductComponent } from './add-excel-product.component';

describe('AddExcelProductComponent', () => {
  let component: AddExcelProductComponent;
  let fixture: ComponentFixture<AddExcelProductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExcelProductComponent]
    });
    fixture = TestBed.createComponent(AddExcelProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
