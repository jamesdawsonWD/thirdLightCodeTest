import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-thumb-card-view',
  templateUrl: './thumb-card-view.component.html',
})
export class ThumbCardViewComponent {
  @Input() thumb: string;
  @Input() title: string;
  constructor() { }

}
