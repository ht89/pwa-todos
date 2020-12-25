import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// App
import { LoaderComponent } from './components/loader/loader.component';
import { AddBtnComponent } from './components/add-btn/add-btn.component';

// Primeng
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [CommonModule, ButtonModule],
  declarations: [LoaderComponent, AddBtnComponent],
  exports: [LoaderComponent, AddBtnComponent],
})
export class SharedModule {}
