
// Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { ImageDashboardComponent } from '@core/components/image-dashboard/image-dashboard.component';

// Views
import { ThumbCardViewModule } from '@core/views/thumb-card-view/thumb-card-view.module';

// Services
import { DashboardContainerComponent } from './dashboard-container.component';
import { ImagePreviewComponent } from '@core/components/image-preview/image-preview.component';
import { StoreService } from '@core/services/store.service';

// Routes
const routes: Routes = [
  { path: '',               component: ImageDashboardComponent },
  { path: 'preview/:name',  component: ImagePreviewComponent },
];

@NgModule({
  imports:      [CommonModule, ThumbCardViewModule, RouterModule.forChild(routes)],
  declarations: [ImageDashboardComponent, DashboardContainerComponent, ImagePreviewComponent],
  providers:    [StoreService],
})
export class DashboardContainerModule {}
