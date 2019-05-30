import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Image, AllImages, Response } from '@lib/models';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class HTTPservice {
    constructor(
        private http: HttpClient,
        private store: StoreService
    ) {}

    public getAllImages(): Observable<Image[]> {
        return this.http.get(`${this.store.serverUrl}/dir/images`).pipe(
          map((res: Response<AllImages>) => res.data.files),
          catchError(e => throwError(e))
        );
      }

}