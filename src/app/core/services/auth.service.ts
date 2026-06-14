import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  modules: string[];
}

export interface StoredUser {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  modules: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/auth';
  private readonly TOKEN_KEY = 'stok_token';
  private readonly USER_KEY = 'stok_user';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        const user: StoredUser = {
          userId: res.userId,
          email: res.email,
          fullName: res.fullName,
          role: res.role,
          modules: res.modules ?? []
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.API}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API}/reset-password`, { token, newPassword });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): StoredUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'ADMINISTRADOR';
  }

  canEdit(): boolean {
    return this.getUser()?.role !== 'VISUALIZADOR';
  }

  canDelete(): boolean {
    const role = this.getUser()?.role;
    return role === 'ADMINISTRADOR' || role === 'GERENTE';
  }

  canAccessModule(module: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    if (user.role === 'ADMINISTRADOR') return true;
    return user.modules?.includes(module) ?? false;
  }
}
