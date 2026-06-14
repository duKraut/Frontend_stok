import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-configs-form',
  standalone: false,
  templateUrl: './configs-form.html',
  styleUrl: './configs-form.css',
})
export class ConfigsForm implements OnInit {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() user: User | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  errorMessage = '';
  toastLeaving = false;
  warnMessage = '';
  warnLeaving = false;
  showCloseConfirm = false;
  submitted = false;

  allModules = [
    { key: 'ALMOXARIFADO', label: 'Almoxarifado', icon: 'ph ph-archive-box' },
    { key: 'PATRIMONIO', label: 'Patrimônio', icon: 'ph ph-buildings' },
    { key: 'FORNECEDORES', label: 'Fornecedores', icon: 'ph ph-handshake' },
    { key: 'RELATORIOS', label: 'Relatórios', icon: 'ph ph-chart-bar' },
    { key: 'CONFIGURACOES', label: 'Configurações', icon: 'ph ph-gear' },
  ];

  get validationErrors() {
    const val = this.form?.value ?? {};
    const passwordFilled = !!val.password;
    return {
      fullName: !val.fullName?.trim(),
      email: !val.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.email),
      password: this.mode === 'create' && !val.password,
      confirm: (this.mode === 'create' || passwordFilled) && val.password !== val.confirm,
      department: !val.department,
      role: !val.role,
    };
  }

  get hasErrors(): boolean {
    return Object.values(this.validationErrors).some(v => v);
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userModules = this.user?.modules ?? [];

    this.form = this.fb.group({
      active: [this.user?.active ?? true],
      fullName: [this.user?.fullName ?? '', Validators.required],
      email: [this.user?.email ?? '', [Validators.required, Validators.email]],
      password: ['', this.mode === 'create' ? Validators.required : []],
      confirm: [''],
      role: [this.mode === 'create' ? '' : (this.user?.role ?? ''), Validators.required],
      department: [this.user?.department ?? ''],
      modules: this.fb.group(
        Object.fromEntries(this.allModules.map(m => [m.key, userModules.includes(m.key)]))
      )
    });

    if (this.mode === 'view') {
      this.form.disable();
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.hasErrors) {
      if (this.validationErrors.email && this.form.value.email?.trim()) {
        this.showWarn('E-mail inválido.');
      }
      return;
    }

    const val = this.form.value;
    const selectedModules = this.allModules
      .filter(m => val.modules[m.key])
      .map(m => m.key);

    const req = {
      fullName: val.fullName,
      email: val.email,
      password: val.password || undefined,
      role: val.role,
      department: val.department,
      active: val.active,
      modules: selectedModules
    };

    this.loading = true;

    const call = this.mode === 'create'
      ? this.userService.create(req)
      : this.userService.update(this.user!.id, req);

    call.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
      },
      error: (err) => {
        this.loading = false;
        this.showError(err);
      }
    });
  }

  private showWarn(message: string): void {
    this.warnLeaving = false;
    this.warnMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.warnLeaving = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.warnMessage = '';
        this.warnLeaving = false;
        this.cdr.detectChanges();
      }, 400);
    }, 4000);
  }

  private showError(error: any): void {
    this.toastLeaving = false;
    this.errorMessage = error?.error?.message || 'Erro ao salvar usuário. Tente novamente.';
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastLeaving = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.errorMessage = '';
        this.toastLeaving = false;
        this.cdr.detectChanges();
      }, 400);
    }, 4000);
  }

  toggleActive(): void {
    if (this.mode !== 'view') {
      const ctrl = this.form.get('active');
      ctrl?.setValue(!ctrl.value);
      this.form.markAsDirty();
    }
  }

  selectRole(role: string): void {
    if (this.mode !== 'view') {
      this.form.get('role')?.setValue(role);
      this.form.markAsDirty();
    }
  }

  attemptClose(): void {
    if (this.form.dirty) {
      this.showCloseConfirm = true;
    } else {
      this.close.emit();
    }
  }

  confirmClose(): void {
    this.showCloseConfirm = false;
    this.submitted = false;
    this.close.emit();
  }

  cancelClose(): void {
    this.showCloseConfirm = false;
  }

  closeDrawer(): void {
    this.attemptClose();
  }

  requestEdit(): void {
    this.editRequested.emit();
  }
}
