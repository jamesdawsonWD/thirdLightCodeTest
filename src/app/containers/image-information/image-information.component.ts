import { Component } from "@angular/core";
import { StoreService } from "@core/services/store.service";
import { checkObjectProps, ImageTL, Vector } from "@lib/helpers";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageComment } from "@lib/models";
@Component({
  selector: "app-image-information",
  templateUrl: "./image-information.component.html",
  styleUrls: ["./image-information.component.sass"]
})
export class ImageInformationComponent {
  public image = this.store.getCurrentImage();
  public author = this.store.getUser();

  public checkObjectProps = checkObjectProps;
  public position: Vector;
  public src: string;
  public item = "add";
  private serverUrl: string = this.store.serverUrl;
  public comment;

  constructor(private store: StoreService, private modalService: NgbModal) {
    this.src = this.serverUrl + this.image.getLinks().preview;
  }
  public openModal(content): void {
    this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
  }
  public createComment(position: Vector, comment: string, author: string): ImageComment {
    return {
      comment,
      position,
      author,
      created: new Date()
    };
  }
  public setPosition(v: Vector) {
    this.position = v;
  }
  public addComment(position: Vector, comment: string, author: string) {
    const comments = this.image.getComments();
    comments.push(this.createComment(position, comment, author));
    this.item = "view";
    this.store.nextCurrentComment(comments);
  }

  public closeModal() {
    this.item = "add";
    this.comment = '';
  }
  public addText() {
    this.item = "text";
  }
}
