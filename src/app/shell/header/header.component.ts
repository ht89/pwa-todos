import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@app/auth';
import { ShellComponent } from '../shell.component';
import { FormControl } from '@angular/forms';
import { PubSubChannel } from '@shared/enums/publish-subscribe';
import { PublishSubscribeService } from '@app/@core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  queryField = new FormControl();

  constructor(
    public authService: AuthenticationService,
    public app: ShellComponent,
    private pubSubService: PublishSubscribeService<string>
  ) {}

  ngOnInit() {
    this.subscribeToQueryField();
  }

  logout() {
    this.authService.logout();
  }

  private subscribeToQueryField() {
    this.queryField.valueChanges.subscribe((query) => this.pubSubService.publish(PubSubChannel.Search, query));
  }
}
