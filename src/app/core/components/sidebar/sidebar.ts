import { Component, OnInit } from '@angular/core';
import { AuthService, StoredUser } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  user: StoredUser | null = null;
  showLogoutConfirm = false;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
  }

  get userInitials(): string {
    const name = this.user?.fullName ?? '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  get roleLabel(): string {
    const map: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      GERENTE: 'Gerente',
      OPERADOR: 'Operador',
      VISUALIZADOR: 'Visualizador',
    };
    return map[this.user?.role ?? ''] ?? (this.user?.role ?? '');
  }

  hasModule(module: string): boolean {
    if (!this.user) return false;
    if (this.user.role === 'ADMINISTRADOR') return true;
    return this.user.modules?.includes(module) ?? false;
  }

  isAdmin(): boolean {
    return this.user?.role === 'ADMINISTRADOR';
  }

  logout(): void {
    this.showLogoutConfirm = true;
  }

  confirmLogout(): void {
    this.showLogoutConfirm = false;
    this.auth.logout();
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }
}
