import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [ProjectsComponent],
  imports: [CommonModule, FormsModule, SharedModule, ProjectsRoutingModule, TableModule, InputTextModule],
})
export class ProjectsModule {}
