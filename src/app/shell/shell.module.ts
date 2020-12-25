// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// App
import { ShellComponent } from './shell.component';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { MenuItemComponent } from './menu/menu-item.component';
import { SharedModule } from '@app/@shared';

// Primeng
import { ToastModule } from 'primeng/toast';

@NgModule({
  imports: [CommonModule, SharedModule, RouterModule, ReactiveFormsModule, ToastModule],
  declarations: [HeaderComponent, ShellComponent, MenuComponent, MenuItemComponent],
})
export class ShellModule {}
