import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPages } from './pages/login-pages/login-pages';

const routes: Routes = [
  { path: '', component: LoginPages}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
