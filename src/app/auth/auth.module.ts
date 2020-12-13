import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login.component';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, AuthRoutingModule, InputTextModule],
  declarations: [LoginComponent],
})
export class AuthModule {}
