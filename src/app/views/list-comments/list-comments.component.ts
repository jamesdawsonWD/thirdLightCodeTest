import { Component, OnInit, Input } from '@angular/core';
import { ImageComment } from '@lib/models';

@Component({
  selector: 'view-list-comments',
  templateUrl: './list-comments.component.html',
})
export class ListCommentsComponent implements OnInit {
  @Input() comment: ImageComment; 
  constructor() { }

  ngOnInit() {
  }

}
