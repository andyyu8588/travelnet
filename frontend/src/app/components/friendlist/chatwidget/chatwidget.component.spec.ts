import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatwidgetComponent } from './chatwidget.component';

describe('ChatwidgetComponent', () => {
  let component: ChatwidgetComponent;
  let fixture: ComponentFixture<ChatwidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatwidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatwidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
