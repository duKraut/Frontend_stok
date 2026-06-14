import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AssetsRoutingModule } from './assets-routing-module';
import { SharedModule } from '../../shared/shared-module';
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
    FormsModule,
    RouterModule,
    AssetsRoutingModule,
    SharedModule
  ]
})
export class AssetsModule { }
