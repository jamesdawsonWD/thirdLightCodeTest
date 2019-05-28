import { Component, OnInit } from '@angular/core';
import { HTTPservice } from '@core/services/http.service';
import { Image } from '@lib/models';
import { getThumbNail } from '@lib/helpers';
import { environment } from '@environments/environment';
@Component({
  selector: 'app-image-container',
  templateUrl: './image-container.component.html',
})
export class ImageContainerComponent implements OnInit {
  public serverUrl = this.http.serverUrl;
  public allImages$ = this.http.getAllImages();
  public getThumbNail = getThumbNail;
  constructor(private http: HTTPservice) { }

  ngOnInit() {
  }


}
