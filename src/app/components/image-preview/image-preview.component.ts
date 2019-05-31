import { Component, OnInit, AfterViewInit } from "@angular/core";
import { StoreService } from "@core/services/store.service";
import { Vector } from "@lib/helpers/vector";

@Component({
  selector: "app-image-preview",
  templateUrl: "./image-preview.component.html"
})
export class ImagePreviewComponent implements OnInit, AfterViewInit{
  public serverUrl: string = this.store.serverUrl;
  public image = this.store.getCurrentImage();

  // Canvas
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mouse: Vector;

  constructor(private store: StoreService) {}

  ngOnInit() {
    this.canvas = document.querySelector("canvas") as HTMLCanvasElement;



    console.log(this.store.getpreviewSize());
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.mouse = new Vector(innerWidth / 2, innerHeight / 2);



  }

  addNewComment(event) {
    console.log(event);
  }
  ngAfterViewInit() {
    const img = new Image();
    img.src = document.querySelector("img").src;
    img.onload = () => {
      console.log(img);
      this.canvas.width = img.height;
      this.canvas.height = img.width;
    }

    console.log(img, this.canvas.height);
  }
}
