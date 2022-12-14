import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {

  constructor(private http:HttpClient) { }
  readonly baseURI='http://localhost:4000'
  token:any;
  postSign(){
    return this.http.post(this.baseURI+'/login',{email:'jimin.park@bts.org',password:'pass123'})
  }
  set setTokenVal(val: any) {
    this.token = val;
  }
  get getTokenVal() {
    return this.token;
  }
}
