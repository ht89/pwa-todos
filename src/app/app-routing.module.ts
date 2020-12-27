import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
      path: 'home',
      loadChildren: () => import('./pages/home/home.module').then((m) => m.HomeModule),
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
