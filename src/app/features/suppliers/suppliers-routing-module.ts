import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuppliersHome } from './pages/suppliers-home/suppliers-home';
import { SuppliersForm } from './pages/suppliers-form/suppliers-form';

const routes: Routes = [
  { path: "", component: SuppliersHome },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuppliersRoutingModule { }
