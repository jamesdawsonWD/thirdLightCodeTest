import { Component, OnInit } from '@angular/core';
import { HTTPservice } from '@core/services/http.service';
import { getImageThumbNail } from '@lib/helpers';
@Component({
  selector: 'app-image-container',
  templateUrl: './image-container.component.html',
})
export class ImageContainerComponent implements OnInit {
  public serverUrl = this.http.serverUrl;
  public allImages$ = this.http.getAllImages();
  public getThumbNail = getImageThumbNail;
  constructor(private http: HTTPservice) { }

  ngOnInit() {
  }


}
