import { Component, OnInit, Input } from '@angular/core';
import { Image } from '@lib/models';

@Component({
  selector: 'app-images-list-view',
  templateUrl: './images-list-view.component.html',
})
export class ImagesListViewComponent {
  @Input() thumb: string;
  @Input() title: string;
  constructor() { }

}
