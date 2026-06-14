import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ConfigsRoutingModule } from './configs-routing-module';
import { ConfigsHome } from './pages/configs-home/configs-home';
import { ConfigsForm } from './pages/configs-form/configs-form';


@NgModule({
  declarations: [
    ConfigsHome,
    ConfigsForm
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ConfigsRoutingModule
  ]
})
export class ConfigsModule { }
