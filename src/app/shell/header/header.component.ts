import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '@app/auth';
import { ShellComponent } from '../shell.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(private authService: AuthenticationService, public app: ShellComponent) {}

  ngOnInit() {}

  logout() {
    this.authService.logout();
  }
}
