import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExcelProductImageComponent } from './add-excel-product-image.component';

describe('AddExcelProductImageComponent', () => {
  let component: AddExcelProductImageComponent;
  let fixture: ComponentFixture<AddExcelProductImageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExcelProductImageComponent]
    });
    fixture = TestBed.createComponent(AddExcelProductImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
