import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigsHome } from './pages/configs-home/configs-home';

const routes: Routes = [
  { path: "", component: ConfigsHome }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigsRoutingModule { }
