import { Component } from '@angular/core';
import { StoreService } from '@core/services/store.service';
import { checkObjectProps, ImageTL, Vector } from '@lib/helpers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageComment, User } from '@lib/models';
@Component({
  selector: 'app-image-information',
  templateUrl: './image-information.component.html',
  styleUrls: ['./image-information.component.sass']
})
export class ImageInformationComponent {
  public image: ImageTL;
  public author: User;
  public viewAll: boolean;
  public position: Vector;
  public comment: string;
  public src: string;
  public modalType = 'add';
  public singleComments: ImageComment[];
  private serverUrl: string;

  // Lib Functions
  public checkObjectProps = checkObjectProps;

  constructor(private store: StoreService, private modalService: NgbModal) {
    this.serverUrl = this.store.serverUrl;
    this.viewAll = true;
    this.image = this.store.getCurrentImage();
    this.author = this.store.getUser();
    this.comment = '';
    this.src = this.serverUrl + this.image.getLinks().preview;
    this.singleComments = [];
  }
  public openModal(content, modalType: string): void {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    this.modalType = modalType;
    this.comment = '';
  }
  public openModalWithComment(
    comment: ImageComment,
    content,
    modalType: string
  ): void {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    this.modalType = modalType;
    this.singleComments = [comment];
  }
  public createComment(
    position: Vector,
    comment: string,
    author: User
  ): ImageComment {
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
  public swapView(show: boolean, comments: ImageComment[]) {
    this.viewAll = !show;
    this.store.nextComments(this.viewAll ? comments : []);
  }
  public addComment(position: Vector, comment: string, comments: ImageComment[]) {
    this.modalType = 'view';
    comments.push(this.createComment(position, comment, this.author));
    this.store.nextComments(comments);
  }
  public closeModal() {
    this.modalType = 'add';
    this.comment = '';
  }
  public addText() {
    this.modalType = 'text';
  }
  public save() {

  }
}
