import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsHome } from './pages/reports-home/reports-home';

const routes: Routes = [
  { path: "", component: ReportsHome }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
