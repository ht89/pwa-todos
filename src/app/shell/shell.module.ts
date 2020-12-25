import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShellComponent } from './shell.component';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { MenuItemComponent } from './menu/menu-item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonModule],
  declarations: [HeaderComponent, ShellComponent, MenuComponent, MenuItemComponent],
})
export class ShellModule {}
