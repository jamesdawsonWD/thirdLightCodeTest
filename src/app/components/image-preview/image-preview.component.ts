import { Component, OnInit } from "@angular/core";
import { StoreService } from "@core/services/store.service";
import { Vector, ImageTL, checkObjectProps } from "@lib/helpers/";
import { ImageComment } from "@lib/models";

@Component({
  selector: "app-image-preview",
  templateUrl: "./image-preview.component.html"
})
export class ImagePreviewComponent implements OnInit {
  public serverUrl: string = this.store.serverUrl;
  public image = this.store.getCurrentImage();

  // Canvas
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mouse: Vector;

  constructor(private store: StoreService) {}

  ngOnInit() {
    this.canvas = document.querySelector("canvas") as HTMLCanvasElement;

    this.canvas.height = 640;
    this.canvas.width = 640;

    const src = this.serverUrl + this.image.getLinks().preview;
    const img = new Image();

    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, 640, 640);
    };
    img.src = src;

    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.mouse = new Vector(innerWidth / 2, innerHeight / 2);
  }

  public getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent): Vector {
    const rect = canvas.getBoundingClientRect();
    return new Vector(evt.clientX - rect.left, evt.clientY - rect.top);
  }

  public addNewComment(
    event: MouseEvent,
    comment: string,
    author: string,
    img: ImageTL
  ) {
    const imageComment: ImageComment = {
      comment,
      position: this.getMousePos(this.canvas, event),
      author,
      created: new Date()
    };
    img.addComment(imageComment);
  }
}
