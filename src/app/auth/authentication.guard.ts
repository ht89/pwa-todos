import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// App
import { Logger } from '@core';
import { isAuthenticated } from './firebase/common.js';

// Const
const log = new Logger('AuthenticationGuard');

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (isAuthenticated()) {
      return true;
    }

    log.warn('Not authenticated, redirecting and adding redirect url...');
    this.router.navigate(['login'], { queryParams: { redirect: state.url }, replaceUrl: true });
    return false;
  }
}
