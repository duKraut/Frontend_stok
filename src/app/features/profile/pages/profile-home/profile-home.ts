import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, StoredUser } from '../../../../core/services/auth.service';
import { UserService } from '../../../configs/services/user.service';
import { HeaderService } from '../../../../core/services/header';

@Component({
  selector: 'app-profile-home',
  standalone: false,
  templateUrl: './profile-home.html',
  styleUrl: './profile-home.css',
})
export class ProfileHome implements OnInit {
  user: StoredUser | null = null;

  emailForm!: FormGroup;
  passwordForm!: FormGroup;

  emailLoading = false;
  passwordLoading = false;

  successMessage = '';
  successLeaving = false;
  errorMessage = '';
  errorLeaving = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.headerService.setConfig({ showSearch: false, searchPlaceholder: '' });
    this.user = this.auth.getUser();

    this.emailForm = this.fb.group({
      email: [this.user?.email ?? '', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required]
    });
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

  get emailInvalid(): boolean {
    const ctrl = this.emailForm.get('email');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get passwordMismatch(): boolean {
    const val = this.passwordForm.value;
    return val.confirm && val.newPassword !== val.confirm;
  }

  saveEmail(): void {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) return;

    this.emailLoading = true;
    this.userService.updateSelf({ email: this.emailForm.value.email }).subscribe({
      next: () => {
        this.emailLoading = false;
        const stored = this.auth.getUser();
        if (stored) {
          stored.email = this.emailForm.value.email;
          localStorage.setItem('stok_user', JSON.stringify(stored));
          this.user = stored;
        }
        this.showSuccess('E-mail atualizado com sucesso.');
      },
      error: (err) => {
        this.emailLoading = false;
        this.showError(err?.error?.message || 'Erro ao atualizar e-mail.');
      }
    });
  }

  savePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;
    if (this.passwordMismatch) {
      this.showError('As senhas não coincidem.');
      return;
    }

    const val = this.passwordForm.value;
    this.passwordLoading = true;
    this.userService.updateSelf({
      currentPassword: val.currentPassword,
      newPassword: val.newPassword
    }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordForm.reset();
        this.showSuccess('Senha alterada com sucesso.');
      },
      error: (err) => {
        this.passwordLoading = false;
        this.showError(err?.error?.message || 'Erro ao alterar senha.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successLeaving = false;
    this.successMessage = msg;
    this.cdr.detectChanges();
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

  private showError(msg: string): void {
    this.errorLeaving = false;
    this.errorMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.errorLeaving = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.errorMessage = '';
        this.errorLeaving = false;
        this.cdr.detectChanges();
      }, 400);
    }, 4000);
  }
}
