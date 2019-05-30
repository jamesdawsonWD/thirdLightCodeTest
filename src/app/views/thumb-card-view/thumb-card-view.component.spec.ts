import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbCardViewComponent } from './thumb-card-view.component';

describe('ThumbCardViewComponent', () => {
  let component: ThumbCardViewComponent;
  let fixture: ComponentFixture<ThumbCardViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbCardViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
