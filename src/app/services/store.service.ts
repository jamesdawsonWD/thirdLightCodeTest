import { Injectable } from '@angular/core';
import { HTTPservice } from './http.service';
import { Observable } from 'rxjs';
import { Image } from '@lib/models';
import { environment } from '@environments/environment';

@Injectable()
export class StoreService {
    readonly serverUrl = environment.serverUrl;
    private currentImage: Image;
    private allImages$: Observable<Image[]> = this.http.getAllImages();
    private previewSize = environment.preview;
    constructor(private http: HTTPservice) {}

    public getCurrentImage(): Image {
        return this.currentImage;
    }
    public getAllImages(): Observable<Image[]> {
        return this.allImages$;
    }
    public getpreviewSize(): string{
        return this.previewSize;
    }
    public setpreviewSize(size: string) {
        this.previewSize = size;
    }
    public setCurrentImage(image: Image) {
        this.currentImage = image;
    }
    public setAllImages(images: Observable<Image[]> ) {
        this.allImages$ = images;
    }
}