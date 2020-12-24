import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppService {
  private searchSubject = new Subject<string>();

  constructor() {}

  get searchObservable(): Observable<string> {
    return this.searchSubject.asObservable();
  }

  set searchKey(val: string) {
    this.searchSubject.next(val);
  }
}
