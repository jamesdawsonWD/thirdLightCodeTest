import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  /**
   * Lazy load the images container - this allows for more features to easily be added using lazy loading in the future
   */
  {
    path: '', children: [
      { path: '', loadChildren: './containers/image-view-container/image-container.module#ImageContainerModule' },
    ]
  },
  { path: '**', redirectTo: ''},
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
