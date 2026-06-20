import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { HeaderService } from '../../../../core/services/header';
import { UserService, User } from '../../services/user.service';
import { ConfigsForm } from '../configs-form/configs-form';

type UserFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-configs-home',
  standalone: false,
  templateUrl: './configs-home.html',
  styleUrl: './configs-home.css',
})
export class ConfigsHome implements OnInit, OnDestroy {
  @ViewChild('userForm') userForm?: ConfigsForm;

  allUsers: User[] = [];
  termoBusca = '';
  private searchSub?: Subscription;

  activeTab: 'Todos' | 'Ativos' | 'Inativos' = 'Todos';
  paginaAtual = 1;
  itensPorPagina = 5;

  isUserFormOpen = false;
  userFormMode: UserFormMode = 'create';
  selectedUser: User | null = null;

  successMessage = '';
  successLeaving = false;

  get filteredUsers() {
    let result = this.allUsers;
    if (this.activeTab === 'Ativos') result = result.filter(u => u.active === true);
    if (this.activeTab === 'Inativos') result = result.filter(u => u.active === false);
    if (this.termoBusca) result = result.filter(u => this.match(this.termoBusca, u.fullName, u.email, u.role, u.department));
    return result;
  }

  private match(term: string, ...fields: (string | number | undefined | null)[]): boolean {
    const t = term.toLowerCase();
    return fields.some(f => f?.toString().toLowerCase().includes(t));
  }

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.itensPorPagina));
  }

  get itemsDisplayed() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.filteredUsers.slice(inicio, inicio + this.itensPorPagina);
  }

  get arrayPaginas() {
    return Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  get totalAtivos() { return this.allUsers.filter(u => u.active === true).length; }
  get totalAdmins() { return this.allUsers.filter(u => u.role === 'ADMINISTRADOR').length; }

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
    if (role === 'ADMINISTRADOR') return 'avatar-admin';
    if (role === 'GERENTE') return 'avatar-manager';
    if (role === 'OPERADOR') return 'avatar-operator';
    return 'avatar-viewer';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      GERENTE: 'Gerente',
      OPERADOR: 'Operador',
      VISUALIZADOR: 'Visualizador'
    };
    return map[role] ?? role;
  }

  openCreateUser(): void {
    this.userFormMode = 'create';
    this.selectedUser = null;
    this.isUserFormOpen = true;
  }

  openEditUser(user: User): void {
    this.selectedUser = user;
    this.userFormMode = 'edit';
    if (this.isUserFormOpen) {
      this.isUserFormOpen = false;
      setTimeout(() => {
        this.isUserFormOpen = true;
        this.cdr.detectChanges();
      }, 0);
    } else {
      this.isUserFormOpen = true;
    }
  }

  openViewUser(user: User): void {
    this.userFormMode = 'view';
    this.selectedUser = user;
    this.isUserFormOpen = true;
  }

  closeUserForm(): void {
    this.isUserFormOpen = false;
  }

  backdropClick(): void {
    if (this.userFormMode === 'view') {
      this.closeUserForm();
    } else {
      this.userForm?.attemptClose();
    }
  }

  onUserSaved(): void {
    const wasCreate = this.userFormMode === 'create';
    this.closeUserForm();
    this.loadUsers();

    this.successLeaving = false;
    this.successMessage = wasCreate
      ? 'Usuário cadastrado com sucesso.'
      : 'Usuário atualizado com sucesso.';

    setTimeout(() => {
      this.successLeaving = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.successMessage = '';
        this.successLeaving = false;
        this.cdr.detectChanges();
      }, 400);
    }, 4000);
  }

  constructor(
    private headerService: HeaderService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: 'Buscar usuário, e-mail ou perfil...',
      showSearch: true,
      primaryButtonLabel: 'Novo Usuário',
      primaryButtonIcon: 'ph ph-plus'
    });
    this.searchSub = this.headerService.search$.subscribe(t => {
      this.termoBusca = t;
      this.paginaAtual = 1;
      this.cdr.detectChanges();
    });
    this.loadUsers();
  }

  ngOnDestroy(): void { this.searchSub?.unsubscribe(); }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.allUsers = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.paginaAtual = Math.min(this.paginaAtual, this.totalPaginas);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar usuários', err)
    });
  }
}
