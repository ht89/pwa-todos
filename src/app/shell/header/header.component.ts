import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@app/auth';
import { ShellComponent } from '../shell.component';
import { AppService } from '@app/app.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  queryField = new FormControl();

  constructor(public authService: AuthenticationService, public app: ShellComponent, private appService: AppService) {}

  ngOnInit() {
    this.subscribeToQueryField();
  }

  logout() {
    this.authService.logout();
  }

  private subscribeToQueryField() {
    this.queryField.valueChanges.subscribe((query) => {
      console.log(query);
      this.appService.searchKey = query;
    });
  }
}
