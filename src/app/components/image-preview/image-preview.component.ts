import { Component, OnInit } from "@angular/core";
import { StoreService } from "@core/services/store.service";
import { Vector, ImageTL, checkObjectProps } from "@lib/helpers/";
import {  ImageComment } from '@lib/models';

@Component({
  selector: "app-image-preview",
  templateUrl: "./image-preview.component.html"
})
export class ImagePreviewComponent implements OnInit {
  public serverUrl: string = this.store.serverUrl;
  public image = this.store.getCurrentImage();
  public checkObjectProps = checkObjectProps;

  // Canvas
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mouse: Vector;

  constructor(private store: StoreService) {}

  ngOnInit() {
    this.canvas = document.querySelector("canvas") as HTMLCanvasElement;

    this.canvas.height = 640;
    this.canvas.width = 640;

    console.log(this.image);

    const src = this.serverUrl + this.image.getLinks().preview;
    const img = new Image();

    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, 640, 640);
    };
    img.src = src;

    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.mouse = new Vector(innerWidth / 2, innerHeight / 2);
  }

  public addNewComment(comment: ImageComment, img: ImageTL) {
    img.addComment(comment);
  }
}
