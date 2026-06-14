import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateLayout } from './layouts/private-layout/private-layout';
import { AuthGuard } from './core/guards/auth.guard';
import { ModuleGuard } from './core/guards/module.guard';

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
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard-module').then(m => m.DashboardModule),
      },
      {
        path: 'inventory',
        canActivate: [ModuleGuard],
        data: { module: 'ALMOXARIFADO' },
        loadChildren: () =>
          import('./features/inventory/inventory-module').then(m => m.InventoryModule),
      },
      {
        path: 'assets',
        canActivate: [ModuleGuard],
        data: { module: 'PATRIMONIO' },
        loadChildren: () =>
          import('./features/assets/assets-module').then(m => m.AssetsModule),
      },
      {
        path: 'suppliers',
        canActivate: [ModuleGuard],
        data: { module: 'FORNECEDORES' },
        loadChildren: () =>
          import('./features/suppliers/suppliers-module').then(m => m.SuppliersModule),
      },
      {
        path: 'reports',
        canActivate: [ModuleGuard],
        data: { module: 'RELATORIOS' },
        loadChildren: () =>
          import('./features/reports/reports-module').then(m => m.ReportsModule),
      },
      {
        path: 'configs',
        canActivate: [ModuleGuard],
        data: { requireAdmin: true },
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
