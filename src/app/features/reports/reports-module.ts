import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportsRoutingModule } from './reports-routing-module';
import { ReportsHome } from './pages/reports-home/reports-home';


@NgModule({
  declarations: [ReportsHome],
  imports: [CommonModule, FormsModule, ReportsRoutingModule]
})
export class ReportsModule { }
