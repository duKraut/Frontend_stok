import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuppliersRoutingModule } from './suppliers-routing-module';
import { SuppliersHome } from './pages/suppliers-home/suppliers-home';
import { SuppliersForm } from './pages/suppliers-form/suppliers-form';


@NgModule({
  declarations: [
    SuppliersHome,
    SuppliersForm
  ],
  imports: [
    CommonModule,
    SuppliersRoutingModule
  ]
})
export class SuppliersModule { }
