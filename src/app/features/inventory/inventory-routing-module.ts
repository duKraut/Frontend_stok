import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryHome } from './pages/inventory-home/inventory-home';
import { InventoryMovements } from './pages/inventory-movements/inventory-movements';

const routes: Routes = [
  { path: '', component: InventoryHome },
  { path: 'movements', component: InventoryMovements }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
