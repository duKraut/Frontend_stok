import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';

type UserFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-configs-home',
  standalone: false,
  templateUrl: './configs-home.html',
  styleUrl: './configs-home.css',
})
export class ConfigsHome implements OnInit {
  allUsers = [
    { id: '1', name: 'Ana Paula Ferreira', email: 'ana.ferreira@sistema.com', role: 'Administrador', department: 'TI', status: 'Ativo', statusClass: 'badge-Ativo' },
    { id: '2', name: 'Bruno Henrique Costa', email: 'bruno.costa@sistema.com', role: 'Gerente', department: 'Almoxarifado', status: 'Ativo', statusClass: 'badge-Ativo' },
    { id: '3', name: 'Carla Mendes Ribeiro', email: 'carla.ribeiro@sistema.com', role: 'Operador', department: 'Patrimônio', status: 'Ativo', statusClass: 'badge-Ativo' },
    { id: '4', name: 'Diego Alves Santana', email: 'diego.santana@sistema.com', role: 'Visualizador', department: 'Compras', status: 'Inativo', statusClass: 'badge-Inativo' },
    { id: '5', name: 'Elisa Rodrigues Lima', email: 'elisa.lima@sistema.com', role: 'Operador', department: 'Almoxarifado', status: 'Ativo', statusClass: 'badge-Ativo' },
    { id: '6', name: 'Felipe Torres Gomes', email: 'felipe.gomes@sistema.com', role: 'Gerente', department: 'TI', status: 'Ativo', statusClass: 'badge-Ativo' },
    { id: '7', name: 'Gabriela Nunes Pinto', email: 'gabriela.pinto@sistema.com', role: 'Visualizador', department: 'Financeiro', status: 'Pendente', statusClass: 'badge-Pendente' },
    { id: '8', name: 'Henrique Souza Barros', email: 'henrique.barros@sistema.com', role: 'Operador', department: 'Patrimônio', status: 'Inativo', statusClass: 'badge-Inativo' },
  ];

  activeTab: 'Todos' | 'Ativos' | 'Inativos' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isUserFormOpen = false;
  userFormMode: UserFormMode = 'create';
  selectedUser: any = null;

  get filteredUsers() {
    if (this.activeTab === 'Ativos') return this.allUsers.filter(u => u.status === 'Ativo');
    if (this.activeTab === 'Inativos') return this.allUsers.filter(u => u.status === 'Inativo');
    return this.allUsers;
  }

  get totalPaginas() {
    return Math.ceil(this.filteredUsers.length / this.itensPorPagina);
  }

  get itemsDisplayed() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.filteredUsers.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() {
    return Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  get totalAtivos() {
    return this.allUsers.filter(u => u.status === 'Ativo').length;
  }

  get totalAdmins() {
    return this.allUsers.filter(u => u.role === 'Administrador').length;
  }

  setTab(tab: 'Todos' | 'Ativos' | 'Inativos') {
    this.activeTab = tab;
    this.paginaAtual = 1;
  }

  irParaPagina(pagina: number) { this.paginaAtual = pagina; }
  proximaPagina() { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }
  paginaAnterior() { if (this.paginaAtual > 1) this.paginaAtual--; }

  getInitials(name: string): string {
    return name.split(' ').filter(w => w.length > 0).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getRoleAvatarClass(role: string): string {
    if (role === 'Administrador') return 'avatar-admin';
    if (role === 'Gerente') return 'avatar-manager';
    if (role === 'Operador') return 'avatar-operator';
    return 'avatar-viewer';
  }

  openCreateUser(): void {
    this.userFormMode = 'create';
    this.selectedUser = null;
    this.isUserFormOpen = true;
  }

  openEditUser(user: any): void {
    this.userFormMode = 'edit';
    this.selectedUser = user;
    this.isUserFormOpen = true;
  }

  openViewUser(user: any): void {
    this.userFormMode = 'view';
    this.selectedUser = user;
    this.isUserFormOpen = true;
  }

  closeUserForm(): void {
    this.isUserFormOpen = false;
  }

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar usuário, e-mail ou perfil...',
      showSearch: true,
      primaryButtonLabel: 'Novo Usuário',
      primaryButtonIcon: 'ph ph-plus'
    });
  }
}
