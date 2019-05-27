import { Injectable } from '@angular/core';
import { HTTPservice } from './http.service';

@Injectable()
export class FacadeService {


    constructor(private http: HTTPservice) {}
}