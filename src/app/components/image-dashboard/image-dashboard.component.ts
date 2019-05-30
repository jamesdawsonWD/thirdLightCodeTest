import { Component, OnInit } from '@angular/core';
import { getImageThumbNail } from '@lib/helpers';
import { StoreService } from '@core/services/store.service';
import { Observable } from 'rxjs';
import { Image } from '@lib/models';

@Component({
  selector: 'app-image-dashboard',
  templateUrl: './image-dashboard.component.html',
})
export class ImageDashboardComponent implements OnInit {
  public serverUrl: string = this.store.serverUrl;
  public allImages$: Observable<Image[]> = this.store.getAllImages;
  
  // functions
  public getThumbNail = getImageThumbNail;
  public appendPreview = (s: string) => `/preview/${s}/`;

  constructor(private store: StoreService) { }

  ngOnInit() {
  }

}
