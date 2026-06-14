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

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
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
    this.auth.logout();
  }
}
