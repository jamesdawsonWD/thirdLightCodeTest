import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ListCommentsComponent } from "./list-comments.component";
import { CommentModule } from '../comment/comment.module';
@NgModule({
  imports: [CommonModule, CommentModule],
  declarations: [ListCommentsComponent],
  exports: [ListCommentsComponent]
})
export class ListCommentsModule {}
