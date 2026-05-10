import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuppliersHome } from './pages/suppliers-home/suppliers-home';
import { SuppliersForm } from './pages/suppliers-form/suppliers-form';

const routes: Routes = [
  { path: "", component: SuppliersHome },
  { path : "new", component: SuppliersForm },
  { path : "edit/:id", component: SuppliersForm } //vai puxar do banco, provavelmente mude pra uuid
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuppliersRoutingModule { }
