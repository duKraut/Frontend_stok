import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from '../../../../core/services/header';

type BemFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-patrimonio-home',
  standalone: false,
  templateUrl: './patrimonio-home.html',
  styleUrl: './patrimonio-home.css',
})
export class PatrimonioHome implements OnInit {
  todosAtivos = [
    { tombamento: '1', nome: 'Notebook Dell Latitude 5420', desc: 'Core i7, 16GB RAM, 512GB SSD', marca: 'Dell', categoria: 'Informática', aquisicao: '12/05/2022', depto: 'TI - Sede', estado: 'EXCELENTE', estadoClass: 'badge-excelente', valor: 'R$ 5.400,00' },
    { tombamento: '2', nome: 'Ar Condicionado 12k BTU', desc: 'Samsung Digital Inverter', marca: 'Samsung', categoria: 'Equipamentos de Escritório', alerta: true, aquisicao: '15/03/2019', depto: 'Vendas', estado: 'MANUTENÇÃO', estadoClass: 'badge-manutencao', valor: 'R$ 2.100,00' },
    { tombamento: '3', nome: 'Cadeira Ergonômica Pro', desc: 'Ajuste de Lombar e Braços', marca: 'GenioDesk', categoria: 'Mobiliário', aquisicao: '20/01/2021', depto: 'Financeiro', estado: 'BOM', estadoClass: 'badge-bom', valor: 'R$ 1.200,00' },
    { tombamento: '4', nome: 'Projetor Epson X41', desc: 'Sala de Reunião A', marca: 'Epson', categoria: 'Eletrônicos', perigo: true, aquisicao: '05/06/2018', depto: 'Adm.', estado: 'SUBSTITUIR', estadoClass: 'badge-substituir', valor: 'R$ 800,00' },
    { tombamento: '5', nome: 'Servidor PowerEdge R740', desc: 'Rack 01 - Data Center', marca: 'Dell', categoria: 'Informática', aquisicao: '10/11/2023', depto: 'TI - Infra', estado: 'EXCELENTE', estadoClass: 'badge-excelente', valor: 'R$ 45.000,00' },
    { tombamento: '6', nome: 'Monitor Dell 24"', desc: 'IPS Full HD', marca: 'Dell', categoria: 'Informática', aquisicao: '12/11/2023', depto: 'TI - Infra', estado: 'EXCELENTE', estadoClass: 'badge-excelente', valor: 'R$ 1.000,00' }
  ];

  activeTab: 'Todos' | 'Excelente' | 'Bom' | 'Manutenção' | 'Substituir' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isBemFormOpen = false;
  bemFormMode: BemFormMode = 'create';
  selectedBem: any = null;

  get ativosFiltrados() {
    if (this.activeTab === 'Excelente')  return this.todosAtivos.filter(a => a.estado === 'EXCELENTE');
    if (this.activeTab === 'Bom')        return this.todosAtivos.filter(a => a.estado === 'BOM');
    if (this.activeTab === 'Manutenção') return this.todosAtivos.filter(a => a.estado === 'MANUTENÇÃO');
    if (this.activeTab === 'Substituir') return this.todosAtivos.filter(a => a.estado === 'SUBSTITUIR');
    return this.todosAtivos;
  }

  get totalPaginas() { return Math.ceil(this.ativosFiltrados.length / this.itensPorPagina); }

  get itensExibidos() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.ativosFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() { return Array(this.totalPaginas).fill(0).map((_, i) => i + 1); }

  setTab(tab: 'Todos' | 'Excelente' | 'Bom' | 'Manutenção' | 'Substituir') {
    this.activeTab = tab;
    this.paginaAtual = 1;
  }

  irParaPagina(pagina: number) { this.paginaAtual = pagina; }
  proximaPagina() { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }

  openCreateBem(): void {
    this.bemFormMode = 'create';
    this.selectedBem = null;
    this.isBemFormOpen = true;
  }

  openEditBem(bem: any): void {
    this.bemFormMode = 'edit';
    this.selectedBem = bem;
    this.isBemFormOpen = true;
  }

  openViewBem(bem: any): void {
    this.bemFormMode = 'view';
    this.selectedBem = bem;
    this.isBemFormOpen = true;
  }

  closeBemForm(): void { this.isBemFormOpen = false; }

  goToMovimentacoes(): void {
    this.router.navigate(['/patrimonio/movimentacoes']);
  }

  constructor(private headerService: HeaderService, private router: Router) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar tombamento, descrição ou categoria...',
      showSearch: true,
      primaryButtonLabel: 'Novo Bem',
      primaryButtonIcon: 'ph ph-plus'
    });
  }
}
