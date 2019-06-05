import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageShowCommentsComponent } from './image-show-comments.component';

describe('ImageShowCommentsComponent', () => {
  let component: ImageShowCommentsComponent;
  let fixture: ComponentFixture<ImageShowCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageShowCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageShowCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
