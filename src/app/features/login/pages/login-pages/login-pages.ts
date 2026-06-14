import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

type LoginView = 'login' | 'forgot' | 'forgot-sent' | 'reset' | 'reset-done';

@Component({
  selector: 'app-login-pages',
  standalone: false,
  templateUrl: './login-pages.html',
  styleUrl: './login-pages.css',
})
export class LoginPages implements OnInit {

  view: LoginView = 'login';
  loading = false;
  errorMsg = '';

  loginForm!: FormGroup;
  forgotForm!: FormGroup;
  resetForm!: FormGroup;

  private resetToken = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.resetToken = params['token'];
        this.view = 'reset';
      }
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.errorMsg = 'Preencha o e-mail e a senha corretamente.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.message || 'Erro ao conectar. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  onForgot(): void {
    if (this.forgotForm.invalid) {
      this.errorMsg = 'Informe um e-mail válido.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    this.auth.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.view = 'forgot-sent';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'E-mail não encontrado.';
        this.cdr.detectChanges();
      }
    });
  }

  onReset(): void {
    const { password, confirm } = this.resetForm.value;
    if (this.resetForm.invalid) return;
    if (password !== confirm) {
      this.errorMsg = 'As senhas não coincidem.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.auth.resetPassword(this.resetToken, password).subscribe({
      next: () => {
        this.loading = false;
        this.view = 'reset-done';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Token inválido ou expirado.';
        this.cdr.detectChanges();
      }
    });
  }

  setView(v: LoginView): void {
    this.view = v;
    this.errorMsg = '';
  }
}
