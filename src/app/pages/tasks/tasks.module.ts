import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// App
import { SharedModule } from '@shared';
import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';

// Primeng
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [CommonModule, SharedModule, TasksRoutingModule, TableModule, ButtonModule],
  declarations: [TasksComponent],
})
export class TasksModule {}
