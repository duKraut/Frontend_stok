import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { AssetMovement, AssetMovementService } from '../../services/asset-movement.service';
import { Asset, AssetService } from '../../services/asset.service';
import { UserSummary, UserService } from '../../../configs/services/user.service';

@Component({
  selector: 'app-assets-movements-form',
  standalone: false,
  templateUrl: './assets-movements-form.html',
  styleUrl: './assets-movements-form.css',
})
export class AssetsMovementsForm implements OnChanges, OnInit {
  @Input() mode: 'create' | 'view' = 'create';
  @Input() movimentacao: AssetMovement | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  tipoSelecionado: 'TRANSFERENCIA' | 'MANUTENCAO' | 'ESTADO' = 'TRANSFERENCIA';
  novoEstado: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'SUBSTITUIR' | 'BAIXAR' | '' = '';
  selectedAssetId = '';
  assets: Asset[] = [];
  assetDisplay = (a: any) => `${a.name} (Tomb. ${a.tombamento})`;

  users: UserSummary[] = [];
  userNameFn = (u: any) => u.fullName;

  submitted = false;
  isSaving = false;
  errorMessage = '';
  toastLeaving = false;
  showCloseConfirm = false;
  readonly today = new Date().toLocaleDateString('en-CA');

  get isDirty(): boolean {
    if (this.mode !== 'create') return false;
    return !!(
      this.selectedAssetId ||
      this.formData.responsible?.trim() ||
      this.formData.date ||
      this.formData.toDepartment?.trim() ||
      this.formData.maintenanceType ||
      this.novoEstado
    );
  }

  formData: AssetMovement = this.emptyForm();

  departamentos = [
    'TI - Sede', 'TI - Infra', 'Administrativo', 'Financeiro',
    'Almoxarifado', 'Vendas', 'Recursos Humanos', 'Diretoria',
    'Manutenção', 'Recepção'
  ];

  motivosBaixa = [
    'Obsolescência tecnológica',
    'Fim da vida útil',
    'Dano irreparável',
    'Extravio ou furto',
    'Doação',
    'Venda',
    'Perda total (sinistro)',
    'Outro'
  ];

  destinacoesFinal = [
    'Descarte / Sucata',
    'Reciclagem',
    'Doação a entidade',
    'Leilão',
    'Devolução ao fornecedor',
    'Outro'
  ];

  justificativasTransferencia = [
    'Realocação por reestruturação',
    'Substituição de equipamento',
    'Solicitação do departamento',
    'Empréstimo temporário',
    'Reforma ou obras',
    'Outro'
  ];

  get validationErrors() {
    return {
      asset:              !this.selectedAssetId,
      responsible:        !this.formData.responsible?.trim(),
      date:               !this.formData.date,
      toDepartment:       this.tipoSelecionado === 'TRANSFERENCIA' && !this.formData.toDepartment?.trim(),
      sameDepartment:     this.tipoSelecionado === 'TRANSFERENCIA' &&
                          !!this.formData.toDepartment?.trim() &&
                          this.formData.toDepartment === this.formData.fromDepartment,
      maintenanceType:    this.tipoSelecionado === 'MANUTENCAO' && !this.formData.maintenanceType,
      returnBeforeSend:   this.tipoSelecionado === 'MANUTENCAO' &&
                          !!this.formData.sendDate && !!this.formData.expectedReturnDate &&
                          this.formData.expectedReturnDate < this.formData.sendDate,
      novoEstado:         this.tipoSelecionado === 'ESTADO' && !this.novoEstado,
      decommissionReason: this.tipoSelecionado === 'ESTADO' && this.novoEstado === 'BAIXAR' && !this.formData.decommissionReason?.trim(),
    };
  }

  get hasErrors(): boolean {
    return Object.values(this.validationErrors).some(v => v);
  }

  get canDelete(): boolean { return this.auth.canDelete(); }

  constructor(
    private movService: AssetMovementService,
    private assetService: AssetService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (data) => { this.assets = data.filter(a => a.active); this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar bens', err)
    });
    this.userService.getActive().subscribe({
      next: (data) => { this.users = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Erro ao carregar usuários', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.movimentacao && this.mode === 'view') {
      this.tipoSelecionado = this.movimentacao.type;
      this.selectedAssetId = this.movimentacao.asset?.id ?? '';
      this.formData = { ...this.movimentacao };
      if (this.movimentacao.type === 'ESTADO') {
        this.novoEstado = this.movimentacao.decommission ? 'BAIXAR' : (this.movimentacao.newConservationStatus ?? '');
      }
      return;
    }
    if (this.mode === 'create') {
      this.tipoSelecionado = 'TRANSFERENCIA';
      this.novoEstado = '';
      this.selectedAssetId = '';
      this.submitted = false;
      this.formData = this.emptyForm();
    }
  }

  onAssetChange(): void {
    const asset = this.assets.find(a => a.id === this.selectedAssetId);
    if (asset) {
      this.formData.fromDepartment = asset.department ?? '';
    }
  }

  save(): void {
    if (this.isSaving) return;
    this.submitted = true;
    if (this.hasErrors) return;

    this.isSaving = true;
    const payload: AssetMovement = {
      ...this.formData,
      type: this.tipoSelecionado,
      asset: { id: this.selectedAssetId },
      decommission: this.tipoSelecionado === 'ESTADO' && this.novoEstado === 'BAIXAR',
      newConservationStatus: this.tipoSelecionado === 'ESTADO' && this.novoEstado !== 'BAIXAR' && this.novoEstado
        ? this.novoEstado as 'EXCELENTE' | 'BOM' | 'REGULAR' | 'SUBSTITUIR'
        : this.formData.newConservationStatus
    };

    this.movService.create(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
        this.closeDrawer();
      },
      error: (error) => {
        this.isSaving = false;
        this.showError(error);
      }
    });
  }

  attemptClose(): void {
    if (this.isDirty) {
      this.showCloseConfirm = true;
    } else {
      this.closeDrawer();
    }
  }

  confirmClose(): void {
    this.showCloseConfirm = false;
    this.closeDrawer();
  }

  cancelClose(): void {
    this.showCloseConfirm = false;
  }

  closeDrawer(): void {
    this.submitted = false;
    this.showCloseConfirm = false;
    this.close.emit();
  }

  private emptyForm(): AssetMovement {
    return {
      type: 'TRANSFERENCIA',
      fromDepartment: '',
      toDepartment: '',
      responsible: '',
      date: '',
      observations: '',
      serviceOrder: '',
      maintenanceType: undefined,
      serviceProvider: '',
      sendDate: '',
      expectedReturnDate: '',
      estimatedCost: undefined,
      finalCost: undefined,
      problemDescription: '',
      decommissionReason: '',
      decommissionTerm: '',
      alienationValue: undefined,
      technicalOpinion: '',
      finalDestination: ''
    };
  }

  private showError(error: any): void {
    this.toastLeaving = false;
    this.errorMessage = error?.error?.message || 'Erro ao registrar movimentação. Tente novamente.';
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
}
