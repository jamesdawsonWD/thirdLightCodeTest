// Core
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";

// Components
import { ImageDashboardComponent } from "@core/containers/image-dashboard/image-dashboard.component";
import { ImagePreviewComponent } from "@core/components/image-preview/image-preview.component";

// Views
import { ThumbCardViewModule } from "@core/views/thumb-card-view/thumb-card-view.module";
import { ListCommentsModule } from "@core/views/list-comments/list-comments.module";
import { ImageInfoModule } from "@core/views/image-info/image-info.module";
import { CommentModule } from "@core/views/comment/comment.module";

// Services
import { StoreService } from "@core/services/store.service";
import { ImageInformationComponent } from '../image-information/image-information.component';

// Imports
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Routes
const routes: Routes = [
  { path: "", component: ImageDashboardComponent },
  { path: "preview/:name", component: ImageInformationComponent },


];

@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    ThumbCardViewModule,
    ListCommentsModule,
    ImageInfoModule,
    CommentModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ImageDashboardComponent, ImagePreviewComponent, ImageInformationComponent],
  providers: [StoreService],
  bootstrap: [ImageDashboardComponent]
})
export class ImageDashboardModule {}
