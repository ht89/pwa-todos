import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: 'tasks', pathMatch: 'full' },
    {
      path: 'tasks',
      loadChildren: () => import('./pages/tasks/tasks.module').then((m) => m.TasksModule),
    },
    {
      path: 'projects',
      loadChildren: () => import('./pages/projects/projects.module').then((m) => m.ProjectsModule),
    },
  ]),
  // Fallback when no prior route is matched
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
