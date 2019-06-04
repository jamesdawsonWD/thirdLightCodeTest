import { ImageInfo, ImageLinks, ImageComment, Image } from "@lib/models";

export class ImageTL {
  constructor(
    private name: string = '',
    private size: number = 0,
    private modTime: Date  = new Date(),
    private kind: string =  '',
    private fileType: string =  '',
    private imageInfo: ImageInfo = {
      width: 0,
      height: 0,
      created: new Date(),
      location: '',
      autotags: [],
    },
    private exIf: boolean | null = false,
    private metaData: any =  '',
    private links: ImageLinks = {
      dir: '',
      thumb: '',
      preview: '',
      original: '',
      metadata: ''
    },
    private comments: ImageComment[] = [],
  ) { }

  public getName(): string {
    return this.name;
  }
  public getSize(): number {
    return this.size;
  }
  public getModTime(): Date {
    return this.modTime;
  }
  public getKind(): string {
    return this.kind;
  }
  public getFileType(): string {
    return this.fileType;
  }
  public getImageInfo(): ImageInfo {
    return this.imageInfo;
  }
  public getExIf(): boolean {
    return this.exIf;
  }
  public getMetaData(): ImageLinks {
    return this.metaData;
  }
  public getLinks(): ImageLinks {
    return this.links;
  }
  public getComments(): ImageComment[] {
    return this.comments;
  }
  public setName(name: string): ImageTL {
    this.name = name;
    return this;
  }
  public setSize(size: number): ImageTL {
    this.size = size;
    return this;
  }
  public setModTime(modTime: Date): ImageTL {
    this.modTime = modTime;
    return this;
  }
  public setKind(kind: string): ImageTL {
    this.kind = kind;
    return this;
  }
  public setFileType(fileType: string): ImageTL {
    this.fileType = fileType;
    return this;
  }
  public setImageInfo(imageInfo: ImageInfo): ImageTL {
    this.imageInfo = imageInfo;
    return this;
  }
  public setExIf(exIf: boolean): ImageTL {
    this.exIf = exIf;
    return this;
  }
  public setMetaData(metaData: ImageLinks): ImageTL {
    this.metaData = metaData;
    return this;
  }
  public setLinks(links: ImageLinks): ImageTL {
    this.links = links;
    return this;
  }
  public setComments(comments: ImageComment[]): ImageTL {
    this.comments = comments;
    return this;
  }
  public setImage(image: Image): ImageTL {
    this.setName(image.name);
    this.setSize(image.size);
    this.setExIf(image.exIf);
    this.setFileType(image.fileType);
    this.setImageInfo(image.imageInfo);
    this.setModTime(image.modTime);
    this.setComments(image.comments || []);
    this.setMetaData(image.metaData);
    this.setKind(image.kind);
    this.setLinks(image.links);
    return this;
  }
  public addComment(comment: ImageComment) {
    this.comments.push(comment);
  }
}
