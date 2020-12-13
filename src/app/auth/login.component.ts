import { Component, OnInit, OnDestroy } from '@angular/core';
import { Logger } from '@core';
import { AuthenticationService } from './authentication.service';

const log = new Logger('Login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(public authService: AuthenticationService) {}

  ngOnInit() {}

  ngOnDestroy() {}
}
