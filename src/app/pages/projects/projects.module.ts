import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [ProjectsComponent],
  imports: [CommonModule, SharedModule, ProjectsRoutingModule, TableModule],
})
export class ProjectsModule {}
