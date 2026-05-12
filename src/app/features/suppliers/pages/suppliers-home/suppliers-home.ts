import { Component } from '@angular/core';

@Component({
  selector: 'app-suppliers-home',
  standalone: false,
  templateUrl: './suppliers-home.html',
  styleUrl: './suppliers-home.css',
})
export class SuppliersHome {
  allActives = [
    {name: 'teste', cnpj: '11.111.111/1111-11', agent: 'pessoa teste', cpf: '111.111.111-11', email: 'mail@mail.com'},
    {name: 'teste', cnpj: '11.111.111/1111-11', agent: 'pessoa teste', cpf: '111.111.111-11', email: 'mail@mail.com'},
    {name: 'teste', cnpj: '11.111.111/1111-11', agent: 'pessoa teste', cpf: '111.111.111-11', email: 'mail@mail.com'},
    {name: 'teste', cnpj: '11.111.111/1111-11', agent: 'pessoa teste', cpf: '111.111.111-11', email: 'mail@mail.com'},
    {name: 'teste', cnpj: '11.111.111/1111-11', agent: 'pessoa teste', cpf: '111.111.111-11', email: 'mail@mail.com'},
    {name: 'teste', cnpj: '11.111.111/1111-11', agent: 'pessoa teste', cpf: '111.111.111-11', email: 'mail@mail.com'},
    {name: 'teste', cnpj: '11.111.111/1111-11', agent: 'pessoa teste', cpf: '111.111.111-11', email: 'mail@mail.com'},
    {name: 'teste', cnpj: '11.111.111/1111-11', agent: 'pessoa teste', cpf: '111.111.111-11', email: 'mail@mail.com'},
    {name: 'teste', cnpj: '11.111.111/1111-11', agent: 'pessoa teste', cpf: '111.111.111-11', email: 'mail@mail.com'},
  ];

    paginaAtual = 1;
  itensPorPagina = 5;

  get totalPaginas() { return Math.ceil(this.allActives.length / this.itensPorPagina); }
  
  get itemsDisplayed() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.allActives.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() {
    return Array(this.totalPaginas).fill(0).map((x, i) => i + 1);
  }
  irParaPagina(pagina: number) {
    this.paginaAtual = pagina;
  }
  proximaPagina() {
    if (this.paginaAtual < this.totalPaginas) this.paginaAtual++;
  }
  paginaAnterior() {
    if (this.paginaAtual > 1) this.paginaAtual--;
  }  
}
