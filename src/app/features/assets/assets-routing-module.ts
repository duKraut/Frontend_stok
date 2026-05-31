import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatrimonioHome } from './pages/patrimonio-home/patrimonio-home';
import { PatrimonioMovimentacoes } from './pages/patrimonio-movimentacoes/patrimonio-movimentacoes';

const routes: Routes = [
  { path: '', component: PatrimonioHome },
  { path: 'movimentacoes', component: PatrimonioMovimentacoes }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatrimonioRoutingModule { }
