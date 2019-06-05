import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CommentComponent } from "./comment.component";
import { UserCircleModule } from '@core/views/user-circle/user-circle.module';

@NgModule({
  imports: [CommonModule, UserCircleModule],
  declarations: [CommentComponent],
  exports: [CommentComponent]
})
export class CommentModule {}
