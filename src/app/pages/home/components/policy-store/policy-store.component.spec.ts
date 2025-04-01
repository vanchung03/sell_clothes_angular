import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyStoreComponent } from './policy-store.component';

describe('PolicyStoreComponent', () => {
  let component: PolicyStoreComponent;
  let fixture: ComponentFixture<PolicyStoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyStoreComponent]
    });
    fixture = TestBed.createComponent(PolicyStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
