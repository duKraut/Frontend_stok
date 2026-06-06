import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsHome } from './pages/assets-home/assets-home';
import { AssetsMovements } from './pages/assets-movements/assets-movements';

const routes: Routes = [
  { path: '', component: AssetsHome },
  { path: 'movements', component: AssetsMovements }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetsRoutingModule { }
