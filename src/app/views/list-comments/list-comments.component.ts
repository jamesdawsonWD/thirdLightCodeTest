import { Component, Input } from '@angular/core';
import { ImageComment } from '@lib/models';

@Component({
  selector: 'view-list-comments',
  templateUrl: './list-comments.component.html',
})
export class ListCommentsComponent {
  @Input() comments: ImageComment[];
  constructor() { }
}
