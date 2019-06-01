import { Injectable } from '@angular/core';
import { HTTPservice } from './http.service';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Image } from '@lib/models';
import { ImageTL } from '@lib/helpers';

@Injectable()
export class StoreService {
    readonly serverUrl = environment.serverUrl;
    private currentImage: ImageTL;
    private allImages$: Observable<Image[]> = this.http.getAllImages();
    private previewSize = environment.preview;
    constructor(private http: HTTPservice) {}

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
        return this;
    }
    public setCurrentImage(image: Image) {
        this.currentImage.setImage(image);
        return this;
    }
    public setAllImages(images: Observable<Image[]> ) {
        this.allImages$ = images;
        return this;
    }
}