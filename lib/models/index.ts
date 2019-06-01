import { Vector } from '@lib/helpers/vector';

export interface ImageInfo {
    width: number | null;
    height: number | null;
    created: Date | null;
    location: string | null;
    autotags: string[] | null;
  }
export interface ImageLinks {
    dir: string;
    thumb: string;
    preview: string;
    original: string;
    metadata: string;
  }
export interface Image {
    name: string;
    size: number;
    modTime: Date;
    kind: string;
    fileType: string;
    imageInfo: ImageInfo;
    exIf: boolean | null;
    metaData: any;
    links: ImageLinks;
    comments: ImageComment[];
  }

export interface ImageComment {
  position: Vector;
  author: string;
  created: Date;
  comment: string;
}
export interface Response<T> {
    status: string;
    data: T;
  }
  
export interface AllImages {
    dir: string[] | null;
    files: Image[];
  }