import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsHome } from './pages/assets-home/assets-home';
import { AssetsMovimentacoes } from './pages/assets-movimentacoes/assets-movimentacoes';

const routes: Routes = [
  { path: '', component: AssetsHome },
  { path: 'movements', component: AssetsMovimentacoes }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetsRoutingModule { }
