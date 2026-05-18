import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';

@Component({
  selector: 'app-almoxarifado-home',
  standalone: false,
  templateUrl: './almoxarifado-home.html',
  styleUrl: './almoxarifado-home.css',
})
export class AlmoxarifadoHome implements OnInit{
  todosItens = [
    { nome: 'Papel A4 Sulfite 75g', sku: 'SUP-OFF-001', marca: 'Chamex', categoria: 'Escritório', saldo: 5, unid: 'CX', min: 10, status: 'ESTOQUE BAIXO', statusClass: 'warning-outline' },
    { nome: 'Detergente Líquido 5L', sku: 'CLN-LIQ-042', marca: 'Ypê', categoria: 'Limpeza', saldo: 24, unid: 'UN', min: 5, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { nome: 'Cabo HDMI 2.0 3m', sku: 'IT-ACC-119', marca: 'ELG', categoria: 'Informática', saldo: 0, unid: 'UN', min: 2, status: 'ESGOTADO', statusClass: 'danger-outline' },
    { nome: 'Lâmpada LED 9W Bivolt', sku: 'MAINT-LIG-004', marca: 'Elgin', categoria: 'Manutenção', saldo: 45, unid: 'UN', min: 12, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { nome: 'Café Torrado e Moído 500g', sku: 'KIT-FNB-008', marca: 'Mellita', categoria: 'Copa & Cozinha', saldo: 8, unid: 'PCT', min: 15, status: 'ESTOQUE BAIXO', statusClass: 'warning-outline' },
    { nome: 'Caneta Esferográfica Azul', sku: 'SUP-OFF-015', marca: 'BIC', categoria: 'Escritório', saldo: 50, unid: 'CX', min: 10, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { nome: 'Desinfetante Pinho 2L', sku: 'CLN-LIQ-055', marca: 'Pinho Sol', categoria: 'Limpeza', saldo: 12, unid: 'UN', min: 10, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { nome: 'Teclado USB Padrão', sku: 'IT-PER-099', marca: 'Multilaser', categoria: 'Informática', saldo: 0, unid: 'UN', min: 5, status: 'ESGOTADO', statusClass: 'danger-outline' },
    { nome: 'Fita Crepe 18mm', sku: 'SUP-OFF-088', marca: 'TekBond', categoria: 'Escritório', saldo: 15, unid: 'RL', min: 10, status: 'EM ESTOQUE', statusClass: 'success-outline' },
    { nome: 'Sabonete Líquido 1L', sku: 'CLN-LIQ-012', marca: 'Granado', categoria: 'Limpeza', saldo: 3, unid: 'UN', min: 10, status: 'ESTOQUE BAIXO', statusClass: 'warning-outline' }
  ];

  paginaAtual = 1;
  itensPorPagina = 5;

  get totalPaginas() {
    return Math.ceil(this.todosItens.length / this.itensPorPagina);
  }

  get itensExibidos() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.todosItens.slice(inicio, inicio + this.itensPorPagina);
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

  constructor(private headerService: HeaderService) {}
  
  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar item, marca ou categoria...',
      showSearch: true,
      primaryButtonLabel: 'Novo Fornecedor',
      primaryButtonIcon: 'ph ph-plus'
    });
  }
}
