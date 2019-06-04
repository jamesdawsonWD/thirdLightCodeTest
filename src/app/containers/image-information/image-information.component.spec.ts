import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageInformationComponent } from './image-information.component';

describe('ImageInformationComponent', () => {
  let component: ImageInformationComponent;
  let fixture: ComponentFixture<ImageInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
