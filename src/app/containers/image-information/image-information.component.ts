import { Component } from '@angular/core';
import { StoreService } from '@core/services/store.service';
import { checkObjectProps } from '@lib/helpers';

@Component({
  selector: 'app-image-information',
  templateUrl: './image-information.component.html',
  styleUrls: ['./image-information.component.sass']
})
export class ImageInformationComponent{
  public image = this.store.getCurrentImage();
  public checkObjectProps = checkObjectProps;
  private serverUrl: string = this.store.serverUrl;
  public src: string;

  constructor(
    private store: StoreService,
    ) {
    this.src = this.serverUrl + this.image.getLinks().preview;
  }

}
