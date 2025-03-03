import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleCollectionsComponent } from './sale-collections.component';

describe('SaleCollectionsComponent', () => {
  let component: SaleCollectionsComponent;
  let fixture: ComponentFixture<SaleCollectionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleCollectionsComponent]
    });
    fixture = TestBed.createComponent(SaleCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
