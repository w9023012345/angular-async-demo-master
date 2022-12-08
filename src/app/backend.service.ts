import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor() { }

  public post(){
    return new Observable<string>( observer => {
      setTimeout(() => {
        observer.next('post0');
        observer.complete();
      } , 1000);
    });
  }

  public post1(){
    return new Observable<string>( observer => {
      setTimeout(() => {
        observer.next('post1');
        observer.complete();
      } , 500);
    });
  }

  public post2(){
    return new Observable<string>( observer => {
      setTimeout(() => {
        observer.next('post2');
        observer.complete();
      } , 2000);
    });
  }
}
