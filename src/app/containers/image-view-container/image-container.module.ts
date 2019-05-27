import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { ImagesListViewComponent } from '@core/views/images-list-view/images-list-view.component';
import { ImageContainerComponent } from '@core/containers/image-view-container/image-container.component';

// Services
import { HTTPservice } from '@core/services/http.service';

// Routes
const routes: Routes = [{ path: '', component: ImageContainerComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [ImageContainerComponent, ImagesListViewComponent],
  providers: [HTTPservice]
})
export class ImageContainerModule {}
