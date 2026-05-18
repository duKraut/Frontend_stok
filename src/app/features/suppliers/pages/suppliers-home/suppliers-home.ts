import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';

@Component({
  selector: 'app-suppliers-home',
  standalone: false,
  templateUrl: './suppliers-home.html',
  styleUrl: './suppliers-home.css',
})
export class SuppliersHome implements OnInit{
  allActives = [
    {id: '1', name: 'Carlos Eduardo dos Santos',  cnpj_cpf: '123.456.789-00', category: 'Representante', stats: 'Ativo', statsClass: 'badge-Ativo'},
    {id: '2', name: 'Mariana Costa Oliveira', cnpj_cpf: '456.789.123-55', category: 'Representante', stats: 'Ativo', statsClass: 'badge-Ativo'},
    {id: '3', name: 'InovaTech Soluções Digitais', cnpj_cpf: '45.892.301/0001-85', category: 'Informática e TI', stats: 'Ativo',  statsClass: 'badge-Ativo'},
    {id: '4', name: 'Thiago Pereira Souza', cnpj_cpf: '789.123.456-11', category: 'Representante', stats: 'Inativo',  statsClass: 'badge-Inativo'},
    {id: '5', name: 'Ana Beatriz Ribeiro', cnpj_cpf: '321.654.987-99', category: 'Representante', stats: 'Inativo',  statsClass: 'badge-Inativo'},
    {id: '6', name: 'Lucas Martins Almeida', cnpj_cpf: '654.987.321-88', category: 'Representante', stats: 'Inativo', statsClass: 'badge-Inativo'},
    {id: '7', name: 'Global Office Papelaria', cnpj_cpf: '12.345.678/0001-00', category: 'Papelaria', stats: 'Ativo', statsClass: 'badge-Ativo'},
    {id: '8', name: 'Juliana Mendes Rocha', cnpj_cpf: '987.321.654-22', category: 'Representante', stats: 'Inativo',  statsClass: 'badge-Inativo'},
    {id: '9', name: 'Vanguarda Alimentos e Bebidas', cnpj_cpf: '89.102.345/0001-99', category: 'Alimentícia', stats: 'Ativo',  statsClass: 'badge-Ativo'},
    {id: '10', name: 'Rodrigo Augusto Barbosa', cnpj_cpf: '159.753.486-33', category: 'Outros', stats: 'Ativo',  statsClass: 'badge-Ativo'},
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

  getInitials(name: string): string {
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
  }

  getAvatarClass(category: string): string {
    if (
      category === 'Informática e TI' ||
      category === 'Papelaria' ||
      category === 'Alimentícia'
    ) {
      return 'avatar-company';
    }

    if (category === 'Representante') {
      return 'avatar-person';
    }

    return 'avatar-default';
  }

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar Fornecedor, CNPJ ou categoria...',
      showSearch: true,
      primaryButtonLabel: 'Novo Fornecedor',
      primaryButtonIcon: 'ph ph-plus'
    });
  }
}