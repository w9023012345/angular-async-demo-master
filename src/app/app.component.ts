import { BackendService } from './backend.service';
import { ShowService } from './show-box/show.service';
import { Component } from '@angular/core';
import { combineLatest, Observable, of, interval, fromEvent, from, Subject, ReplaySubject, BehaviorSubject } from 'rxjs';
import { concatMap, delay, map, mergeAll, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-test-demo';
  /**
   *   希望第二次訂閱 source 不會從頭開始接收元素
   *   第一次訂閱到當前處理的元素開始發送
   */
  private destroy$ = new Subject();

  private subject$ = new Subject<string>();
  // 可以給予初始值
  private BehaviorSubject$ = new BehaviorSubject<string>('我是預設值拉');
  // 重新發送最後的幾個元素
  private ReplaySubject$ = new ReplaySubject<string>(3);

  private Observable$ = interval(1000);
  private temp = '';
  private tempSubject = '';


  constructor(private showService: ShowService,
    private backendService: BackendService) { }

  public clean() {
    this.showService.clean();
  }

  public test1() {
    this.showService.log('開始');
    this.backendService.post().subscribe(() => {
      this.showService.log('結束');
    });
  }

  public test2() {
    this.backendService.post().subscribe(() => {
      this.showService.log('結束');
    });
    this.showService.log('開始');
  }

  public test3() {
    this.showService.log('開始');
    this.getData();
    this.showService.log('結束');
  }

  private getData() {
    this.backendService.post().subscribe(() => {
      this.showService.log('拿到了');
    });
  }

  public test4() {
    this.showService.log('開始');
    this.getData2();
  }

  private getData2() {
    this.backendService.post().subscribe(() => {
      this.showService.log('拿到了');
    });
    this.showService.log('結束');
  }

  public solution1() {
    this.showService.log('開始');
    this.getData3().subscribe(() => {
      this.showService.log('結束');
    });
  }

  private getData3() {
    const obser = this.backendService.post();
    obser.subscribe(() => {
      this.showService.log('拿到了');
    });

    return obser;
  }

  public solution2() {
    this.showService.log('開始');
    this.getData4().subscribe(() => {
      this.showService.log('結束');
    });
  }

  private getData4() {
    return new Observable(observer => {
      this.backendService.post().subscribe(() => {
        this.showService.log('拿到了');
        observer.next();
        observer.complete();
      });
    });
  }

  public solution3() {
    this.showService.log('開始');
    this.getData5().then(() => {
      this.showService.log('結束');
    });
  }

  private async getData5() {
    await this.backendService.post().toPromise();
    this.showService.log('拿到了');
  }

  // combineLatest 拿回資料
  public combineLatest() {
    const first$ = this.backendService.post();
    const second$ = this.backendService.post1();
    combineLatest([first$, second$]).subscribe(([first, second]) => {
      this.showService.log(first);
      this.showService.log(second);
    });
  }


  // mergeMap 送出資料
  public solution5() {
    const first$ = this.backendService.post();
    const second$ = this.backendService.post1();
    const third$ = this.backendService.post2();
    first$.pipe(
      mergeMap(() => second$),
      mergeMap(() => third$)
    ).subscribe(res => {
      this.showService.log(res);
    });
  }

  // mergeMap 拿資料
  public mergeMap() {
    const oneSecondSource = of('1 second http request').pipe(delay(1000));
    const twoSecondSource = of('2 second http request').pipe(delay(2000));
    const threeSecondSource = of('3 second http request').pipe(delay(3000));
    const fourSecondSource = of('4 second http request').pipe(delay(4000));
    const fiveSecondSource = of('5 second http request').pipe(delay(5000));
    from([
      fiveSecondSource,
      oneSecondSource,
      twoSecondSource,
      threeSecondSource,
      fourSecondSource
    ])
      .pipe(
        mergeMap(x => x),
      )
      .subscribe(x => this.showService.log(x));
  }


  // concatMap 拿資料
  public concatMap() {
    const oneSecondSource = of('1 second http request').pipe(delay(1000));
    const twoSecondSource = of('2 second http request').pipe(delay(2000));
    const threeSecondSource = of('3 second http request').pipe(delay(3000));
    const fourSecondSource = of('4 second http request').pipe(delay(4000));
    const fiveSecondSource = of('5 second http request').pipe(delay(5000));

    from([
      fiveSecondSource,
      oneSecondSource,
      twoSecondSource,
      threeSecondSource,
      fourSecondSource
    ])
      .pipe(
        concatMap(x => x)
      )
      .subscribe(x => this.showService.log(x));
  }

  // concatMap 送出資料
  public concatMapSend() {
    const first$ = this.backendService.post();
    const second$ = this.backendService.post1();
    const third$ = this.backendService.post2();
    first$.pipe(
      concatMap(() => second$),
      concatMap(() => third$)
    ).subscribe(res => {
      this.showService.log(res);
    });
  }


  // switchMap 資料
  public switchMap() {
    const oneSecondSource = of('1 second http request').pipe(delay(1000));
    const twoSecondSource = of('2 second http request').pipe(delay(2000));
    const threeSecondSource = of('3 second http request').pipe(delay(3000));
    const fourSecondSource = of('4 second http request').pipe(delay(4000));
    const fiveSecondSource = of('5 second http request').pipe(delay(5000));

    from([
      fiveSecondSource,
      oneSecondSource,
      twoSecondSource,
      threeSecondSource,
      fourSecondSource
    ])
      .pipe(
        switchMap(x => x)
      )
      .subscribe(x => this.showService.log(x));
  }

  // 持續訂閱
  public solution10() {
    const source = interval(200);

    source.pipe(
      takeUntil(this.destroy$)
    )
      .subscribe(x => this.showService.log(String(x)));
  }

  // Observable
  public Observable() {
    this.Observable$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(res => {
      this.showService.log(String(res));
      this.showService.log('Observable');
    });
  }

  // Observable2
  public Observable2() {
    this.Observable$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(res => {
      this.showService.log(String(res));
      this.showService.log('Observable2');
    });
  }

  // subject
  public subject() {
    this.subject$.subscribe(res => {
      this.showService.log(res);
      this.showService.log('subject');
    });
  }

  // subject2
  public subject2() {
    this.subject$.subscribe(res => {
      this.showService.log(res);
      this.showService.log('subject2');
    });
  }

  // subject.next
  public subjectNext() {
    this.tempSubject += '123/';
    this.subject$.next(this.tempSubject);
  }

  // BehaviorSubject
  public BehaviorSubject() {
    this.BehaviorSubject$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(res => {
      this.showService.log(res);
    });
  }

  // BehaviorSubject.Next
  public BehaviorSubjectNext() {
    this.BehaviorSubject$.next('我是next拉');
  }

  // ReplaySubject
  public ReplaySubject() {
    this.ReplaySubject$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(res => {
      this.showService.log(res);
    });
  }

  // ReplaySubject.Next
  public ReplaySubjectNext() {
    this.temp += '123/';
    this.ReplaySubject$.next(this.temp);
  }

  public MapTest() {
    this.backendService.post().pipe(
      tap(data => console.log(data)),
      map(res => res + '我在MAP被修改了'),
      tap(data => console.log(data)),
    ).subscribe(res => {
      this.showService.log(res);
    });
  }


  // 解除訂閱
  public destroy() {
    this.temp = '';
    this.tempSubject = '';
    this.destroy$.next(null);
    this.showService.log('按下解除訂閱');
    this.subject$.complete();
    this.subject$ = new Subject<string>();
    this.BehaviorSubject$.complete();
    this.BehaviorSubject$ = new BehaviorSubject<string>('我是預設值拉');
    // 重新發送最後的幾個元素
    this.ReplaySubject$.complete();
    this.ReplaySubject$ = new ReplaySubject<string>(3);
    // this.destroy$.complete();
  }

  // 重新訂閱
  // public newSubject() {
  //   // this.destroy$ = new Subject();
  // }
}
