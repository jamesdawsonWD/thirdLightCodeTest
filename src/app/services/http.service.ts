import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Image, AllImages, Response } from '@lib/models';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HTTPservice {
  private serverUrl = environment.serverUrl;
    constructor(
        private http: HttpClient,
    ) {}

    public getAllImages(): Observable<Image[]> {
        return this.http.get(`${this.serverUrl}/dir/images`).pipe(
          map((res: Response<AllImages>) => res.data.files),
          catchError(e => throwError(e))
        );
      }

}