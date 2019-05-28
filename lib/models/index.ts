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
    imageInfor: ImageInfo;
    exIf: boolean | null;
    metaData: any;
    links: ImageLinks;
  }
  
export interface Response<T> {
    status: string;
    data: T;
  }
  
export interface AllImages {
    dir: string[] | null;
    files: Image[];
  }