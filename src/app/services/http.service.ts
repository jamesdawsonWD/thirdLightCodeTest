import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';


import { Subject, throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HTTPservice {
    readonly serverUrl = environment.serverUrl;
    constructor(
        private http: HttpClient
    ) {}

    public getAllImages(): Observable<any> {
        return this.http.get(`${this.serverUrl}/dir/images`).pipe(
          map(res => res),
          catchError(e => throwError(e))
        );
      }

}