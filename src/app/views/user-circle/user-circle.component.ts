import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-user-circle',
  templateUrl: './user-circle.component.html',
  styles: []
})
export class UserCircleComponent {
  @Input() public initials: string;
  @Input() public color: string;
  @Input() public large? = false;

  constructor() { }

}
