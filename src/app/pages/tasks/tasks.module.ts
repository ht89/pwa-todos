import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
