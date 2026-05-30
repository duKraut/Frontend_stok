import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PatrimonioRoutingModule } from './patrimonio-routing-module';
import { PatrimonioHome } from './pages/patrimonio-home/patrimonio-home';
import { PatrimonioBemForm } from './pages/patrimonio-bem-form/patrimonio-bem-form';
import { PatrimonioMovimentacoes } from './pages/patrimonio-movimentacoes/patrimonio-movimentacoes';
import { PatrimonioMovimentacaoForm } from './pages/patrimonio-movimentacao-form/patrimonio-movimentacao-form';


@NgModule({
  declarations: [
    PatrimonioHome,
    PatrimonioBemForm,
    PatrimonioMovimentacoes,
    PatrimonioMovimentacaoForm
  ],
  imports: [
    CommonModule,
    RouterModule,
    PatrimonioRoutingModule
  ]
})
export class PatrimonioModule { }
