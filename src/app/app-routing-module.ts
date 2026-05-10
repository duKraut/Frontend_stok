import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateLayout } from './layouts/private-layout/private-layout';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/login/login-module').then(m => m.LoginModule),
  },
  {
    path: '',
    component: PrivateLayout,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard-module').then(m => m.DashboardModule),
      },
      {
        path: 'almoxarifado',
        loadChildren: () =>
          import('./features/almoxarifado/almoxarifado-module').then(m => m.AlmoxarifadoModule),
      },
      {
        path: 'patrimonio',
        loadChildren: () =>
          import('./features/patrimonio/patrimonio-module').then(m => m.PatrimonioModule),
      },
      {
        path: 'suppliers',
        loadChildren: () =>
          import('./features/suppliers/suppliers-module').then(m => m.SuppliersModule),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports-module').then(m => m.ReportsModule),
      },
      {
        path: 'configs',
        loadChildren: () =>
          import('./features/configs/configs-module').then(m => m.ConfigsModule),
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
