import { Component, OnInit, OnDestroy } from '@angular/core';
// App
import { loginWithGoogle } from './firebase/common.js';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginWithGoogle = loginWithGoogle;

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
