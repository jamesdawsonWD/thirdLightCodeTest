import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Vector, checkObjectProps, getMousePosition } from '@lib/helpers/';
import { StoreService } from '@core/services/store.service';

export enum ClickOptions {
  Comment,
  Select
}
@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html'
})
export class ImagePreviewComponent implements OnInit {
  @Output() canvasCommentAdded = new EventEmitter<Vector>();

  public serverUrl: string = this.store.serverUrl;
  public image = this.store.getCurrentImage();

  // Helpers
  public checkObjectProps = checkObjectProps;

  // Canvas
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mouse: Vector;

  // Canvas Config
  public Config = {
    colour: '#fff',
    border: '#2b374b',
    size: 10
  };

  constructor(private store: StoreService) {}

  ngOnInit() {
    this.canvas = document.getElementById('preview') as HTMLCanvasElement;

    this.canvas.height = 640;
    this.canvas.width = 640;

    const src = this.serverUrl + this.image.getLinks().preview;
    const img = new Image();

    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, 640, 640);
    };

    img.src = src;

    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.mouse = new Vector(innerWidth / 2, innerHeight / 2);
  }

  public draw(
    event: MouseEvent,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    const src = this.serverUrl + this.image.getLinks().preview;
    const img = new Image();

    img.onload = () => {
      const position = getMousePosition(canvas, event);

      ctx.drawImage(img, 0, 0, 640, 640);

      this.drawCommentLocation(
        position,
        ctx,
        this.Config.border,
        this.Config.size + 5
      );

      this.drawCommentLocation(
        position,
        ctx,
        this.Config.colour,
        this.Config.size
      );

      this.canvasCommentAdded.emit(position);
    };

    img.src = src;
  }
  private drawCommentLocation(
    position: Vector,
    ctx: CanvasRenderingContext2D,
    color: string,
    size: number
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(position.x, position.y);
    ctx.arc(0, 0, size, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}
