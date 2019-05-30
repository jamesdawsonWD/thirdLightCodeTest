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
    constructor(private http: HTTPservice) {}

    get getCurrentImage(): Image {
        return this.currentImage;
    }
    get getAllImages(): Observable<Image[]> {
        return this.allImages$;
    }
    set setCurrentImage(image: Image) {
        this.currentImage = image;
    }
    set setAllImages(images: Observable<Image[]> ) {
        this.allImages$ = images;
    }
}