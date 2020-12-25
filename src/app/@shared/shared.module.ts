import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './components/loader/loader.component';
import { AddBtnComponent } from './components/add-btn/add-btn.component';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [CommonModule, ButtonModule],
  declarations: [LoaderComponent, AddBtnComponent],
  exports: [LoaderComponent, AddBtnComponent],
})
export class SharedModule {}
