import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AlmoxarifadoRoutingModule } from './almoxarifado-routing-module';
import { AlmoxarifadoHome } from './pages/almoxarifado-home/almoxarifado-home';
import { AlmoxarifadoItemForm } from './pages/almoxarifado-item-form/almoxarifado-item-form';
import { AlmoxarifadoMovimentacoes } from './pages/almoxarifado-movimentacoes/almoxarifado-movimentacoes';
import { AlmoxarifadoMovimentacaoForm } from './pages/almoxarifado-movimentacao-form/almoxarifado-movimentacao-form';


@NgModule({
  declarations: [
    AlmoxarifadoHome,
    AlmoxarifadoItemForm,
    AlmoxarifadoMovimentacoes,
    AlmoxarifadoMovimentacaoForm
  ],
  imports: [
    CommonModule,
    RouterModule,
    AlmoxarifadoRoutingModule
  ]
})
export class AlmoxarifadoModule { }
