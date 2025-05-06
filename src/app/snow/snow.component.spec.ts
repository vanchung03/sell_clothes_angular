import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnowComponent } from './snow.component';

describe('SnowComponent', () => {
  let component: SnowComponent;
  let fixture: ComponentFixture<SnowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnowComponent]
    });
    fixture = TestBed.createComponent(SnowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
