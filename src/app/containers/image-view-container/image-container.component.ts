import { Component, OnInit } from '@angular/core';
import { HTTPservice } from '@core/services/http.service';

@Component({
  selector: 'app-image-container',
  templateUrl: './image-container.component.html',
})
export class ImageContainerComponent implements OnInit {

  public allImages$ = this.http.getAllImages();
  constructor(private http: HTTPservice) { }

  ngOnInit() {
  }

}
