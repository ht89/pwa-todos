import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared';
import { FormsModule } from '@angular/forms';

// App
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';

// Primeng
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

// Angular CDK
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  declarations: [ProjectsComponent],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // App
    SharedModule,
    ProjectsRoutingModule,
    // Primeng
    TableModule,
    InputTextModule,
    ButtonModule,
    // Angular CDK
    A11yModule,
  ],
})
export class ProjectsModule {}
