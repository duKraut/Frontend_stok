import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryHome } from './pages/inventory-home/inventory-home';
import { InventoryMovimentacoes } from './pages/inventory-movimentacoes/inventory-movimentacoes';

const routes: Routes = [
  { path: '', component: InventoryHome },
  { path: 'movements', component: InventoryMovimentacoes }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
