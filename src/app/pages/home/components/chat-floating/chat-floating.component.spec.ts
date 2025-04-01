import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatFloatingComponent } from './chat-floating.component';

describe('ChatFloatingComponent', () => {
  let component: ChatFloatingComponent;
  let fixture: ComponentFixture<ChatFloatingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatFloatingComponent]
    });
    fixture = TestBed.createComponent(ChatFloatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
