import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesListViewComponent } from './images-list-view.component';

describe('ImagesListViewComponent', () => {
  let component: ImagesListViewComponent;
  let fixture: ComponentFixture<ImagesListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImagesListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagesListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
