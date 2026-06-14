import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HeaderService } from '../../../../core/services/header';
import { InventoryService, InventoryItem } from '../../../inventory/services/inventory.service';
import { AssetService, Asset } from '../../../assets/services/asset.service';
import { InventoryMovementService, InventoryMovement } from '../../../inventory/services/inventory-movement.service';

export interface CriticalAction {
  type: 'warning' | 'info' | 'danger';
  icon: string;
  title: string;
  desc: string;
  id: string;
  target: 'inventory' | 'asset';
}

interface ChartMonth {
  label: string;
  consumo: number;
  aquisicao: number;
  consumoPct: number;
  aquisicaoPct: number;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: false,
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome implements OnInit {

  totalEstoque = 0;
  alertasEstoqueBaixo = 0;
  valorPatrimonio = 0;
  ativosManutencao = 0;

  chartMonths: ChartMonth[] = [];
  chartYTicks: number[] = [0, 0, 0, 0, 0];

  criticalActions: CriticalAction[] = [];
  isLoading = true;

  constructor(
    private headerService: HeaderService,
    private inventoryService: InventoryService,
    private assetService: AssetService,
    private movementService: InventoryMovementService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.headerService.setConfig({ searchPlaceholder: '', showSearch: false });
    this.loadData();
  }

  private loadData(): void {
    forkJoin({
      items: this.inventoryService.getAll(),
      assets: this.assetService.getAll(),
      movements: this.movementService.getAll()
    }).subscribe({
      next: ({ items, assets, movements }) => {
        this.computeStats(items, assets);
        this.computeChart(movements);
        this.computeActions(items, assets);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; }
    });
  }

  private computeStats(items: InventoryItem[], assets: Asset[]): void {
    const activeItems = items.filter(i => i.active);
    this.totalEstoque = activeItems.filter(i => (i.currentStock ?? 0) > 0).length;
    this.alertasEstoqueBaixo = activeItems.filter(i => (i.currentStock ?? 0) < i.minStock).length;

    const activeAssets = assets.filter(a => a.active);
    this.valorPatrimonio = activeAssets.reduce((s, a) => s + (a.currentValue ?? a.acquisitionValue ?? 0), 0);
    this.ativosManutencao = activeAssets.filter(a => a.conservationStatus === 'MANUTENCAO').length;
  }

  private computeChart(movements: InventoryMovement[]): void {
    const months: ChartMonth[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });

      const monthMovs = movements.filter(m => {
        const md = new Date(m.date);
        return md.getFullYear() === year && md.getMonth() === month;
      });

      const consumo = monthMovs.filter(m => m.type === 'SAIDA').reduce((s, m) => s + m.quantity, 0);
      const aquisicao = monthMovs.filter(m => m.type === 'ENTRADA').reduce((s, m) => s + m.quantity, 0);

      months.push({ label, consumo, aquisicao, consumoPct: 0, aquisicaoPct: 0 });
    }

    const maxVal = Math.max(...months.map(m => Math.max(m.consumo, m.aquisicao)), 1);

    months.forEach(m => {
      m.consumoPct = Math.round((m.consumo / maxVal) * 100);
      m.aquisicaoPct = Math.round((m.aquisicao / maxVal) * 100);
    });

    this.chartMonths = months;
    this.chartYTicks = [
      maxVal,
      Math.round(maxVal * 0.75),
      Math.round(maxVal * 0.5),
      Math.round(maxVal * 0.25),
      0
    ];
  }

  navigateTo(action: CriticalAction): void {
    if (action.target === 'inventory') {
      this.router.navigate(['/inventory/movements'], {
        queryParams: { itemId: action.id, itemName: action.title }
      });
    } else {
      this.router.navigate(['/assets/movements'], {
        queryParams: { assetId: action.id, assetName: action.title }
      });
    }
  }

  private computeActions(items: InventoryItem[], assets: Asset[]): void {
    const actions: CriticalAction[] = [];

    const lowStock = items
      .filter(i => i.active && (i.currentStock ?? 0) < i.minStock);

    for (const item of lowStock) {
      const stock = item.currentStock ?? 0;
      actions.push({
        type: stock === 0 ? 'danger' : 'warning',
        icon: stock === 0 ? 'ph-fill ph-x-circle' : 'ph-fill ph-warning',
        title: item.name,
        desc: stock === 0
          ? `Estoque zerado (Mín: ${item.minStock} ${item.unit})`
          : `Estoque: ${stock} ${item.unit} (Mín: ${item.minStock})`,
        id: item.id!,
        target: 'inventory'
      });
    }

    const emManutencao = assets
      .filter(a => a.active && a.conservationStatus === 'MANUTENCAO');

    for (const asset of emManutencao) {
      actions.push({
        type: 'info',
        icon: 'ph-fill ph-wrench',
        title: asset.name,
        desc: `Em manutenção — ${asset.department}`,
        id: asset.id!,
        target: 'asset'
      });
    }

    const aSubstituir = assets
      .filter(a => a.active && a.conservationStatus === 'SUBSTITUIR');

    for (const asset of aSubstituir) {
      actions.push({
        type: 'danger',
        icon: 'ph-fill ph-warning-circle',
        title: asset.name,
        desc: `Substituição pendente — ${asset.department}`,
        id: asset.id!,
        target: 'asset'
      });
    }

    this.criticalActions = actions;
  }
}
