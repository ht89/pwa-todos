import { Component, OnInit } from '@angular/core';
import { ShellComponent } from '../shell.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  model: any[];

  constructor(public app: ShellComponent) {}

  ngOnInit() {
    this.model = [
      { label: 'Tasks', icon: 'pi pi-fw pi-list', routerLink: ['/'] },
      {
        label: 'Timeline',
        icon: 'pi pi-fw pi-calendar',
        routerLink: ['timeline'],
      },
      {
        label: 'Projects',
        icon: 'pi pi-fw pi-briefcase',
        routerLink: ['/projects'],
      },
    ];
  }

  onMenuClick(event: any) {
    this.app.onMenuClick(event);
  }
}
