import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InventoryRoutingModule } from './inventory-routing-module';
import { InventoryHome } from './pages/inventory-home/inventory-home';
import { InventoryItemForm } from './pages/inventory-item-form/inventory-item-form';
import { InventoryMovimentacoes } from './pages/inventory-movimentacoes/inventory-movimentacoes';
import { InventoryMovimentacaoForm } from './pages/inventory-movimentacao-form/inventory-movimentacao-form';


@NgModule({
  declarations: [
    InventoryHome,
    InventoryItemForm,
    InventoryMovimentacoes,
    InventoryMovimentacaoForm
  ],
  imports: [
    CommonModule,
    RouterModule,
    InventoryRoutingModule
  ]
})
export class InventoryModule { }
