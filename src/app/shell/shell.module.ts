import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthModule } from '@app/auth';
import { ShellComponent } from './shell.component';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { MenuItemComponent } from './menu/menu-item.component';

@NgModule({
  imports: [CommonModule, AuthModule, RouterModule],
  declarations: [HeaderComponent, ShellComponent, MenuComponent, MenuItemComponent],
})
export class ShellModule {}
