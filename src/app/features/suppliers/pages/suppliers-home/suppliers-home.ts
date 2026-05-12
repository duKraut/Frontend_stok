import { Component } from '@angular/core';

@Component({
  selector: 'app-suppliers-home',
  standalone: false,
  templateUrl: './suppliers-home.html',
  styleUrl: './suppliers-home.css',
})
export class SuppliersHome {
  allActives = [
    {name: 'teste', cnpj_cpf: '111.111.111-11', person_contact: 'teste', email: 'mail@mail.com', type: 'Física', stats: 'Ativo'},
    {name: 'teste', cnpj_cpf: '222.222.222-22', person_contact: 'teste', email: 'mail@mail.com', type: 'Física', stats: 'Ativo'},
    {name: 'teste', cnpj_cpf: '33.333.333/3333-33', person_contact: 'teste', email: 'mail@mail.com', type: 'Jurídica', stats: 'Ativo'},
    {name: 'teste', cnpj_cpf: '444.444.444-44', person_contact: 'teste', email: 'mail@mail.com', type: 'Física', stats: 'Inativo'},
    {name: 'teste', cnpj_cpf: '555.555.555-55', person_contact: 'teste', email: 'mail@mail.com', type: 'Física', stats: 'Inativo'},
    {name: 'teste', cnpj_cpf: '666.666.666-66', person_contact: 'teste', email: 'mail@mail.com', type: 'Jurídica', stats: 'Inativo'},
    {name: 'teste', cnpj_cpf: '77.777.777/7777-77', person_contact: 'teste', email: 'mail@mail.com', type: 'Jurídica', stats: 'Ativo'},
    {name: 'teste', cnpj_cpf: '888.888.888-88', person_contact: 'teste', email: 'mail@mail.com', type: 'Física', stats: 'Inativo'},
    {name: 'teste', cnpj_cpf: '99.999.999/9999-99', person_contact: 'teste', email: 'mail@mail.com', type: 'Jurídica', stats: 'Ativo'},
  ];

    paginaAtual = 1;
  itensPorPagina = 6;

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
