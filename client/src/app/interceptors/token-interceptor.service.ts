import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GraphqlService } from '../services/graphql.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor  {

  constructor(private grapgqlService:GraphqlService) { }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const  token  = this.grapgqlService.getTokenVal;
    console.log("Interceptor : ",token);
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(request).pipe(
      catchError((err:any) => {
        if (err.status === 401) {
          console.log("UnAuthorized");
          
        }
        const error = err.error.message || err.statusText;
        return throwError(error);
      })
    );
  }
}
