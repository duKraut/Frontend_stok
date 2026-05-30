import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlmoxarifadoHome } from './pages/almoxarifado-home/almoxarifado-home';
import { AlmoxarifadoMovimentacoes } from './pages/almoxarifado-movimentacoes/almoxarifado-movimentacoes';

const routes: Routes = [
  { path: '', component: AlmoxarifadoHome },
  { path: 'movimentacoes', component: AlmoxarifadoMovimentacoes }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlmoxarifadoRoutingModule { }
