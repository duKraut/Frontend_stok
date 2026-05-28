import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';

@Component({
  selector: 'app-patrimonio-home',
  standalone: false,
  templateUrl: './patrimonio-home.html',
  styleUrl: './patrimonio-home.css',
})
export class PatrimonioHome implements OnInit{
  todosAtivos = [
    { tombamento: '1', nome: 'Notebook Dell Latitude 5420', desc: 'Core i7, 16GB RAM, 512GB SSD', marca: 'Dell', aquisicao: '12/05/2022', depto: 'TI - Sede', estado: 'EXCELENTE', estadoClass: 'badge-excelente', valor: 'R$ 5.400,00' },
    { tombamento: '2', nome: 'Ar Condicionado 12k BTU', desc: 'Samsung Digital Inverter', marca: 'Samsung', alerta: true, aquisicao: '15/03/2019', depto: 'Vendas', estado: 'MANUTENÇÃO', estadoClass: 'badge-manutencao', valor: 'R$ 2.100,00' },
    { tombamento: '3', nome: 'Cadeira Ergonômica Pro', desc: 'Ajuste de Lombar e Braços', marca: 'GenioDesk', aquisicao: '20/01/2021', depto: 'Financeiro', estado: 'BOM', estadoClass: 'badge-bom', valor: 'R$ 1.200,00' },
    { tombamento: '4', nome: 'Projetor Epson X41', desc: 'Sala de Reunião A', marca: 'Epson', perigo: true, aquisicao: '05/06/2018', depto: 'Adm.', estado: 'SUBSTITUIR', estadoClass: 'badge-substituir', valor: 'R$ 800,00' },
    { tombamento: '5', nome: 'Servidor PowerEdge R740', desc: 'Rack 01 - Data Center', marca: 'Microsoft', aquisicao: '10/11/2023', depto: 'TI - Infra', estado: 'EXCELENTE', estadoClass: 'badge-excelente', valor: 'R$ 45.000,00' },
    { tombamento: '6', nome: 'Monitor Dell 24"', desc: 'IPS Full HD', marca: 'Dell', aquisicao: '12/11/2023', depto: 'TI - Infra', estado: 'EXCELENTE', estadoClass: 'badge-excelente', valor: 'R$ 1.000,00' }
  ];

  paginaAtual = 1;
  itensPorPagina = 5;

  get totalPaginas() { return Math.ceil(this.todosAtivos.length / this.itensPorPagina); }
  
  get itensExibidos() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.todosAtivos.slice(inicio, inicio + this.itensPorPagina);
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
      searchPlaceholder: 'Buscar Tombamento, descrição ou categoria...',
      showSearch: true,
      primaryButtonLabel: 'Novo Fornecedor',
      primaryButtonIcon: 'ph ph-plus'
    });
  }
}
