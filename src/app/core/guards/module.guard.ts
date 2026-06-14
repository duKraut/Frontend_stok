import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class ModuleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requireAdmin: boolean = route.data['requireAdmin'] ?? false;
    const module: string | null = route.data['module'] ?? null;

    if (requireAdmin && !this.auth.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    if (module && !this.auth.canAccessModule(module)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
