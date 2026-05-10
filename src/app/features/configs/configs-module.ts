import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigsRoutingModule } from './configs-routing-module';
import { ConfigsHome } from './pages/configs-home/configs-home';


@NgModule({
  declarations: [
    ConfigsHome
  ],
  imports: [
    CommonModule,
    ConfigsRoutingModule
  ]
})
export class ConfigsModule { }
