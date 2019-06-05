import { Component, Input } from '@angular/core';
import { ImageComment } from '@lib/models';
import { randomColorFromArray } from '@lib/helpers';

@Component({
  selector: 'view-comment',
  templateUrl: './comment.component.html'
})
export class CommentComponent {
  @Input() comment: ImageComment;
  public colors = [
    '#18F2B2',
    '#F21858',
    '#18F245',
    '#18C5F2',
    '#F24518',
    '#F2B218',
    '#B218F2',
    '#E55934',
    '#2A586B',
    '#18F2B2'
  ];
  public color = randomColorFromArray(this.colors);
  constructor() { }
  
}
