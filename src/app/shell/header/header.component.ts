import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

// App
import { AuthenticationService } from '@app/auth';
import { ShellComponent } from '../shell.component';
import { PubSubChannel } from '@shared/enums/publish-subscribe';
import { PublishSubscribeService, untilDestroyed } from '@app/@core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  queryField = new FormControl();

  constructor(
    public authService: AuthenticationService,
    public app: ShellComponent,
    private pubSubService: PublishSubscribeService<string>,
  ) {}

  ngOnInit() {
    this.subscribeToQueryField();
  }

  ngOnDestroy() {}

  logout() {
    this.authService.logout();
  }

  private subscribeToQueryField() {
    this.queryField.valueChanges
      .pipe(untilDestroyed(this), distinctUntilChanged(), debounceTime(500))
      .subscribe((query) => this.pubSubService.publish(PubSubChannel.Search, query));
  }
}
