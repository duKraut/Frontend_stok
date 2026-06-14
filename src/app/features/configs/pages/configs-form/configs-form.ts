import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  errorMsg = '';
  showCloseConfirm = false;

  allModules = [
    { key: 'ALMOXARIFADO', label: 'Almoxarifado', icon: 'ph ph-archive-box' },
    { key: 'PATRIMONIO', label: 'Patrimônio', icon: 'ph ph-buildings' },
    { key: 'FORNECEDORES', label: 'Fornecedores', icon: 'ph ph-handshake' },
    { key: 'RELATORIOS', label: 'Relatórios', icon: 'ph ph-chart-bar' },
    { key: 'CONFIGURACOES', label: 'Configurações', icon: 'ph ph-gear' },
  ];

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    const userModules = this.user?.modules ?? [];

    this.form = this.fb.group({
      active: [this.user?.active ?? true],
      fullName: [this.user?.fullName ?? '', Validators.required],
      email: [this.user?.email ?? '', [Validators.required, Validators.email]],
      password: ['', this.mode === 'create' ? Validators.required : []],
      confirm: [''],
      role: [this.user?.role ?? 'OPERADOR', Validators.required],
      department: [this.user?.department ?? ''],
      modules: this.fb.group(
        Object.fromEntries(this.allModules.map(m => [m.key, userModules.includes(m.key)]))
      )
    });

    if (this.mode === 'view') {
      this.form.disable();
    }
  }

  isModuleChecked(key: string): boolean {
    return this.form.get('modules')?.get(key)?.value ?? false;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const val = this.form.value;

    if ((this.mode === 'create' || val.password) && val.password !== val.confirm) {
      this.errorMsg = 'As senhas não coincidem.';
      return;
    }

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
    this.errorMsg = '';

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
        this.errorMsg = err.error?.message || 'Erro ao salvar usuário.';
      }
    });
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
