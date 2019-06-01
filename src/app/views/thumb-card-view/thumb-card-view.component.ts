import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'view-thumb-card',
  templateUrl: './thumb-card-view.component.html',
})
export class ThumbCardViewComponent {
  @Input() thumb: string;
  @Input() title: string;
  constructor() { }

}
