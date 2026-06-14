import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InventoryRoutingModule } from './inventory-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { InventoryHome } from './pages/inventory-home/inventory-home';
import { InventoryForm } from './pages/inventory-form/inventory-form';
import { InventoryMovements } from './pages/inventory-movements/inventory-movements';
import { InventoryMovementsForm } from './pages/inventory-movements-form/inventory-movements-form';


@NgModule({
  declarations: [
    InventoryHome,
    InventoryForm,
    InventoryMovements,
    InventoryMovementsForm
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InventoryRoutingModule,
    SharedModule
  ]
})
export class InventoryModule { }
