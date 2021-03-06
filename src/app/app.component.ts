import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map, switchMap } from 'rxjs/operators';

// App
import { environment } from '@env/environment';
import { Logger, untilDestroyed } from '@core';

// Const
const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private titleService: Title) {}

  ngOnInit(): void {
    // Setup logger
    if (environment.production) {
      // Logger.enableProductionMode();
    }

    log.debug('init');

    this.onNavigationEnd();
  }

  ngOnDestroy(): void {}

  private onNavigationEnd() {
    const onNavigationEnd = this.router.events.pipe(filter((event) => event instanceof NavigationEnd));

    // Change page title on navigation based on route data
    onNavigationEnd
      .pipe(
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        switchMap((route) => route.data),
        untilDestroyed(this),
      )
      .subscribe((event) => {
        const title = event.title;
        if (title) {
          this.titleService.setTitle(title);
        }
      });
  }
}
