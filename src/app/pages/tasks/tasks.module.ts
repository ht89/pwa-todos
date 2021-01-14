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
import { TaskCreationComponent } from './task-creation/task-creation.component';
import { InputTextModule } from 'primeng/inputtext';

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
  ],
  declarations: [TasksComponent, TaskCreationComponent],
})
export class TasksModule {}
