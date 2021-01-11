import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// App
import { SharedModule } from '@shared';
import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';

// Primeng
import { TableModule } from 'primeng/table';

@NgModule({
  imports: [CommonModule, SharedModule, TasksRoutingModule, TableModule],
  declarations: [TasksComponent],
})
export class TasksModule {}
