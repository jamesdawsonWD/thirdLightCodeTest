import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { StoreService } from "@core/services/store.service";
import { Vector, checkObjectProps, getMousePosition } from "@lib/helpers/";
import { ImageComment } from "@lib/models";

export enum ClickOptions {
  Comment,
  Select
}
@Component({
  selector: "app-image-show-comments",
  templateUrl: "./image-show-comments.component.html"
})
export class ImageShowCommentsComponent implements OnInit {
  @Output() canvasCommentClicked = new EventEmitter<ImageComment>();
  @Input() comments: ImageComment[] = [];
  @Input() showComments: boolean;

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
    colour: "#fff",
    border: "#2b374b",
    size: 10
  };

  constructor(private store: StoreService) {}

  /**
   * The canvas for rendering all comments and emitting if a specific comment
   * has been clicked
   */
  ngOnInit() {
    this.canvas = document.getElementById("comments") as HTMLCanvasElement;

    // set the Canvas
    this.canvas.height = 640;
    this.canvas.width = 640;

    const src = this.serverUrl + this.image.getLinks().preview;
    const img = new Image();

    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, 640, 640);
      // subscriber listen for changes to comments and re renders all comments
      this.store.currentComments$.subscribe(comments => {
        this.ctx.drawImage(img, 0, 0, 640, 640);
        if (comments && this.showComments) {
          console.log(comments);
          for (const comment of this.comments) {
            this.drawCommentLocation(
              comment.position,
              this.ctx,
              this.Config.border,
              this.Config.size + 5
            );

            this.drawCommentLocation(
              comment.position,
              this.ctx,
              this.Config.colour,
              this.Config.size
            );
          }
        } else {
          this.ctx.drawImage(img, 0, 0, 640, 640);
        }
      });
    };

    img.src = src;

    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.mouse = new Vector(innerWidth / 2, innerHeight / 2);
  }

  public checkCommentClick(event: MouseEvent, comments: ImageComment[]) {
    if (!comments.length) return;

    const position = getMousePosition(this.canvas, event);

    for (let comment of comments) {
      if (comment.position.distanceSq(position) < this.Config.size + 100) {
        this.canvasCommentClicked.emit(comment);
      }
    }
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
