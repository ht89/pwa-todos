import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PublishSubscribeService<T> {
  private publishSubscribeSubject: Subject<any> = new Subject();
  private emitter: Observable<any>;

  constructor() {
    this.emitter = this.publishSubscribeSubject.asObservable();
  }

  publish(channel: string, event: T): void {
    this.publishSubscribeSubject.next({
      channel,
      event,
    });
  }

  subscribe(channel: string, handler: (value: T) => void): Subscription {
    return this.emitter
      .pipe(
        filter((emission) => emission.channel === channel),
        map((emission) => emission.event)
      )
      .subscribe(handler);
  }
}
