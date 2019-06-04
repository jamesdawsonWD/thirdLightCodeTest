import { Component, Input } from '@angular/core';
import { ImageComment } from '@lib/models';

@Component({
  selector: 'view-comment',
  templateUrl: './comment.component.html'
})
export class CommentComponent {
  @Input() comment: ImageComment;
  constructor() { }
}
