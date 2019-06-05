import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCircleComponent } from './user-circle.component';

@NgModule({
  declarations: [UserCircleComponent],
  imports: [
    CommonModule
  ],
  exports: [
    UserCircleComponent
  ]
})
export class UserCircleModule { }
