import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AssetsRoutingModule } from './assets-routing-module';
import { AssetsHome } from './pages/assets-home/assets-home';
import { AssetsBemForm } from './pages/assets-bem-form/assets-bem-form';
import { AssetsMovimentacoes } from './pages/assets-movimentacoes/assets-movimentacoes';
import { AssetsMovimentacaoForm } from './pages/assets-movimentacao-form/assets-movimentacao-form';


@NgModule({
  declarations: [
    AssetsHome,
    AssetsBemForm,
    AssetsMovimentacoes,
    AssetsMovimentacaoForm
  ],
  imports: [
    CommonModule,
    RouterModule,
    AssetsRoutingModule
  ]
})
export class AssetsModule { }
