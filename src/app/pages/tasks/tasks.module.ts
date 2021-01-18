import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';

// App
import { SharedModule } from '@shared';
import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';

// Primeng
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TasksFormComponent } from './tasks-form/tasks-form.component';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    A11yModule,
    // App
    SharedModule,
    TasksRoutingModule,
    // Primeng
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    AutoCompleteModule,
  ],
  declarations: [TasksComponent, TasksFormComponent],
})
export class TasksModule {}
