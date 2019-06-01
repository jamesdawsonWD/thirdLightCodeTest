import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ListCommentsComponent } from "./list-comments.component";
@NgModule({
  imports: [CommonModule],
  declarations: [ListCommentsComponent],
  exports: [ListCommentsComponent]
})
export class ListCommentsModule {}
