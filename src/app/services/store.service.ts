import { Injectable } from '@angular/core';
import { HTTPservice } from './http.service';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Image } from '@lib/models';
import { ImageTL } from '@lib/helpers';

export interface User {
    firstName: string;
    lastName: string;
    _id: string;
}
@Injectable()
export class StoreService {
    readonly serverUrl = environment.serverUrl;
    private currentImage: ImageTL;
    private allImages$: Observable<Image[]> = this.http.getAllImages();
    private previewSize = environment.preview;
    private user = {
        firstName: 'James',
        lastName: 'Dawson',
        _id: '1'
    }
    constructor(private http: HTTPservice) {
    }

    public getUser(): User {
        return this.user;
    }
    public getCurrentImage(): ImageTL {
        return this.currentImage;
    }
    public getAllImages(): Observable<Image[]> {
        return this.allImages$;
    }
    public getpreviewSize(): string {
        return this.previewSize;
    }
    public setpreviewSize(size: string) {
        this.previewSize = size;
    }
    public setCurrentImage(image: Image) {
        this.currentImage.setImage(image);
    }
    public setAllImages(images: Observable<Image[]> ) {
        this.allImages$ = images;
    }
    public createNewImage(image: Image) {
        this.currentImage = new ImageTL(
            image.name,
            image.size,
            image.modTime,
            image.kind,
            image.fileType,
            image.imageInfo,
            image.exIf,
            image.metaData,
            image.links,
            [],
        );
        console.log(this.currentImage);
    }
}
