import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';


import { Subject, throwError, Observable } from 'rxjs';
import { map, catchError, filter } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Image, AllImages, Response } from '@lib/models';


@Injectable({
  providedIn: 'root'
})
export class HTTPservice {
    readonly serverUrl = environment.serverUrl;
    constructor(
        private http: HttpClient
    ) {}

    public getAllImages(): Observable<Image[]> {
        return this.http.get(`${this.serverUrl}/dir/images`).pipe(
          map((res: Response<AllImages>) => res.data.files),
          catchError(e => throwError(e))
        );
      }

}