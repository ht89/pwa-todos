import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// App
import { ShellComponent } from '../shell.component';
import { PubSubChannel } from '@shared/enums/publish-subscribe';
import { PublishSubscribeService, untilDestroyed } from '@app/@core';
import { logout } from '@app/auth/firebase/custom.js';
import { getUser } from '@shared/functions/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  queryField = new FormControl();

  logout = logout;
  user = getUser();

  constructor(public app: ShellComponent, private pubSubService: PublishSubscribeService<string>) {}

  ngOnInit() {
    this.subscribeToQueryField();
  }

  ngOnDestroy() {}

  private subscribeToQueryField() {
    this.queryField.valueChanges
      .pipe(untilDestroyed(this), distinctUntilChanged(), debounceTime(500))
      .subscribe((query) => this.pubSubService.publish(PubSubChannel.Search, query));
  }
}
