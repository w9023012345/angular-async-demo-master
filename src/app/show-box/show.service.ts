import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowService {
  private logList = [] as string[];
  private replaySubject = new ReplaySubject<string[]>();

  constructor() { }

  public clean(){
    this.logList = [];
    this.emitChange();
  }

  public log( e: string){
    this.logList.push('[' + moment().format('yyyy-MM-DD HH:mm:ss') + ']' + e);
    this.emitChange();
  }

  private emitChange(){
    this.replaySubject.next(this.logList);
  }

  public getLogList(){
    return this.replaySubject.asObservable();
  }
}
