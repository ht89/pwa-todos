import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';

// App
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';

// Primeng
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [ProjectsComponent],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    A11yModule,
    // App
    SharedModule,
    ProjectsRoutingModule,
    // Primeng
    TableModule,
    InputTextModule,
    ButtonModule,
  ],
})
export class ProjectsModule {}
