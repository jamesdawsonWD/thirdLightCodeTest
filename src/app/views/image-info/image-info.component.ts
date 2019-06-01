import { Component, OnInit, Input } from '@angular/core';
import { Image } from '@lib/models';

@Component({
  selector: 'view-image-info',
  templateUrl: './image-info.component.html',
})
export class ImageInfoComponent implements OnInit {
  @Input() image: Image;
  constructor() { }

  ngOnInit() {
  }

}
