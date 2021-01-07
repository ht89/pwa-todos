import { Component, OnInit, OnDestroy } from '@angular/core';
// App
import { Logger } from '@core';
import { loginWithGoogle } from './firebase/common.js';

// Const
const log = new Logger('Login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginWithGoogle = loginWithGoogle;

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}
}
