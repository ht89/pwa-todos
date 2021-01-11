import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TasksComponent } from './tasks.component';

const routes: Routes = [{ path: '', component: TasksComponent, data: { title: 'Tasks' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class TasksRoutingModule {}
