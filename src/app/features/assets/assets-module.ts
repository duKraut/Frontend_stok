import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AssetsRoutingModule } from './assets-routing-module';
import { AssetsHome } from './pages/assets-home/assets-home';
import { AssetsForm } from './pages/assets-form/assets-form';
import { AssetsMovements } from './pages/assets-movements/assets-movements';
import { AssetsMovementsForm } from './pages/assets-movements-form/assets-movements-form';


@NgModule({
  declarations: [
    AssetsHome,
    AssetsForm,
    AssetsMovements,
    AssetsMovementsForm
  ],
  imports: [
    CommonModule,
    RouterModule,
    AssetsRoutingModule
  ]
})
export class AssetsModule { }
