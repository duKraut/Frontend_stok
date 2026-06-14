import { ChangeDetectorRef, Component } from '@angular/core';
import { AssetService, Asset } from '../../../assets/services/asset.service';
import { AssetMovementService, AssetMovement } from '../../../assets/services/asset-movement.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).vfs;

interface MovementsData {
  total: number;
  transfers: number;
  maintenances: number;
  decommissions: number;
  rows: { date: string; type: string; assetName: string; tombamento: number; department: string }[];
}

interface DepartmentsData {
  totalAssets: number;
  totalValue: number;
  rows: { name: string; count: number; value: number }[];
}

interface CriticalData {
  inMaintenance: { tombamento: number; name: string; department: string }[];
  forReplacement: { tombamento: number; name: string; department: string }[];
}

@Component({
  selector: 'app-reports-home',
  standalone: false,
  templateUrl: './reports-home.html',
  styleUrl: './reports-home.css',
})
export class ReportsHome {
  selectedReport: 'movements' | 'departments' | 'critical' | null = null;
  generatedReport: 'movements' | 'departments' | 'critical' | null = null;
  isLoading = false;
  isExporting = false;
  readonly today = new Date();

  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();

  movementsData: MovementsData | null = null;
  departmentsData: DepartmentsData | null = null;
  criticalData: CriticalData | null = null;

  readonly months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
  ];

  readonly years: number[] = (() => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => cur - i);
  })();

  get canGenerate(): boolean {
    if (!this.selectedReport) return false;
    if (this.selectedReport === 'movements') return !!this.month && !!this.year;
    return true;
  }

  constructor(
    private assetService: AssetService,
    private movService: AssetMovementService,
    private cdr: ChangeDetectorRef
  ) {}

  selectReport(type: 'movements' | 'departments' | 'critical'): void {
    this.selectedReport = type;
    this.generatedReport = null;
    this.movementsData = null;
    this.departmentsData = null;
    this.criticalData = null;
  }

  generate(): void {
    if (!this.canGenerate || this.isLoading) return;
    this.isLoading = true;
    this.generatedReport = null;

    if (this.selectedReport === 'movements') {
      this.movService.getAll().subscribe({
        next: (movements) => this.processMovements(movements),
        error: () => { this.isLoading = false; this.cdr.detectChanges(); }
      });
    } else if (this.selectedReport === 'departments') {
      this.assetService.getAll().subscribe({
        next: (assets) => this.processDepartments(assets),
        error: () => { this.isLoading = false; this.cdr.detectChanges(); }
      });
    } else {
      this.assetService.getAll().subscribe({
        next: (assets) => this.processCritical(assets),
        error: () => { this.isLoading = false; this.cdr.detectChanges(); }
      });
    }
  }

  private processMovements(movements: AssetMovement[]): void {
    const filtered = movements.filter(m => {
      if (!m.date) return false;
      const [y, mo] = m.date.split('-').map(Number);
      return mo === this.month && y === this.year;
    });

    this.movementsData = {
      total: filtered.length,
      transfers: filtered.filter(m => m.type === 'TRANSFERENCIA').length,
      maintenances: filtered.filter(m => m.type === 'MANUTENCAO').length,
      decommissions: filtered.filter(m => m.decommission === true).length,
      rows: filtered
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(m => ({
          date: m.date,
          type: this.getMovType(m),
          assetName: m.asset?.name ?? '—',
          tombamento: m.asset?.tombamento ?? 0,
          department: m.fromDepartment ?? '—',
        }))
    };

    this.generatedReport = 'movements';
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private processDepartments(assets: Asset[]): void {
    const active = assets.filter(a => a.active);
    const totalValue = active.reduce((s, a) => s + (a.acquisitionValue ?? 0), 0);

    const grouped = active.reduce((acc, a) => {
      const dept = a.department || '—';
      if (!acc[dept]) acc[dept] = { count: 0, value: 0 };
      acc[dept].count++;
      acc[dept].value += a.acquisitionValue ?? 0;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    this.departmentsData = {
      totalAssets: active.length,
      totalValue,
      rows: Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
        .map(([name, d]) => ({ name, ...d }))
    };

    this.generatedReport = 'departments';
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private processCritical(assets: Asset[]): void {
    const active = assets.filter(a => a.active);
    const toRow = (a: Asset) => ({ tombamento: a.tombamento ?? 0, name: a.name, department: a.department });

    this.criticalData = {
      inMaintenance: active.filter(a => a.conservationStatus === 'MANUTENCAO').map(toRow),
      forReplacement: active.filter(a => a.conservationStatus === 'SUBSTITUIR').map(toRow),
    };

    this.generatedReport = 'critical';
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  getMovType(m: AssetMovement): string {
    if (m.decommission) return 'Baixa';
    if (m.type === 'TRANSFERENCIA') return 'Transferência';
    if (m.type === 'MANUTENCAO') return 'Manutenção';
    return 'Alteração de Estado';
  }

  getMonthName(v: number): string {
    return this.months.find(m => m.value === v)?.label ?? '';
  }

  formatDate(d: string): string {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  formatCurrency(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  getLargestDept(): { name: string; percentage: number } | null {
    if (!this.departmentsData?.rows.length) return null;
    const largest = [...this.departmentsData.rows].sort((a, b) => b.count - a.count)[0];
    const pct = Math.round((largest.count / this.departmentsData.totalAssets) * 100);
    return { name: largest.name, percentage: pct };
  }

  printReport(): void {
    if (this.isExporting) return;
    this.isExporting = true;
    this.cdr.detectChanges();

    const now = this.today.toLocaleString('pt-BR');
    const fileNames: Record<string, string> = {
      movements: 'relatorio-movimentacoes',
      departments: 'relatorio-patrimonial',
      critical: 'relatorio-criticos',
    };

    let content: any[] = [];

    if (this.generatedReport === 'movements' && this.movementsData) {
      const d = this.movementsData;
      content = [
        { text: 'STOK — Sistema de Gestão Patrimonial', style: 'org' },
        { text: 'Relatório Mensal de Movimentações', style: 'title' },
        { text: `Período: ${this.getMonthName(this.month)} / ${this.year}`, style: 'subtitle' },
        { text: `Emitido em: ${now}`, style: 'emitted' },
        { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 1.5, lineColor: '#063b75' }] },
        { text: '1. Resumo do Período', style: 'section', margin: [0, 18, 0, 8] },
        {
          columns: [
            this.kpiBlock('Total', String(d.total)),
            this.kpiBlock('Transferências', String(d.transfers)),
            this.kpiBlock('Manutenções', String(d.maintenances)),
            this.kpiBlock('Baixas', String(d.decommissions)),
          ],
          columnGap: 10,
          margin: [0, 0, 0, 18],
        },
        { text: '2. Detalhamento das Movimentações', style: 'section', margin: [0, 0, 0, 8] },
        {
          table: {
            headerRows: 1,
            widths: [60, 80, '*', 120],
            body: [
              [
                { text: 'Data', style: 'tableHeader' },
                { text: 'Tipo', style: 'tableHeader' },
                { text: 'Bem Patrimonial', style: 'tableHeader' },
                { text: 'Departamento', style: 'tableHeader' },
              ],
              ...( d.rows.length
                ? d.rows.map(r => [
                    this.formatDate(r.date),
                    r.type,
                    `${r.assetName}  #${r.tombamento}`,
                    r.department,
                  ])
                : [[{ text: 'Nenhuma movimentação no período.', colSpan: 4, alignment: 'center', color: '#94a3b8' }, '', '', '']]
              ),
            ],
          },
          layout: this.tableLayout(),
          margin: [0, 0, 0, 18],
        },
        { text: '3. Observações', style: 'section', margin: [0, 0, 0, 8] },
        {
          text: `No período de ${this.getMonthName(this.month)}/${this.year}, foram registradas ${d.total} movimentação(ões) patrimonial(is), sendo ${d.transfers} transferência(s) entre departamentos, ${d.maintenances} envio(s) para manutenção e ${d.decommissions} baixa(s) definitiva(s) de bens.`,
          style: 'obs',
        },
      ];

    } else if (this.generatedReport === 'departments' && this.departmentsData) {
      const d = this.departmentsData;
      const largest = this.getLargestDept();
      content = [
        { text: 'STOK — Sistema de Gestão Patrimonial', style: 'org' },
        { text: 'Relatório Patrimonial por Departamento', style: 'title' },
        { text: `Emitido em: ${now}`, style: 'emitted' },
        { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 1.5, lineColor: '#063b75' }] },
        { text: '1. Resumo Geral', style: 'section', margin: [0, 18, 0, 8] },
        {
          columns: [
            this.kpiBlock('Total de Bens Ativos', String(d.totalAssets)),
            this.kpiBlock('Valor Patrimonial Total', this.formatCurrency(d.totalValue)),
          ],
          columnGap: 10,
          margin: [0, 0, 0, 18],
        },
        { text: '2. Distribuição por Departamento', style: 'section', margin: [0, 0, 0, 8] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, 120],
            body: [
              [
                { text: 'Departamento', style: 'tableHeader' },
                { text: 'Qtde. Bens', style: 'tableHeader', alignment: 'right' },
                { text: 'Valor Total (R$)', style: 'tableHeader', alignment: 'right' },
              ],
              ...( d.rows.length
                ? d.rows.map(r => [
                    r.name,
                    { text: String(r.count), alignment: 'right' },
                    { text: this.formatCurrency(r.value), alignment: 'right' },
                  ])
                : [[{ text: 'Nenhum bem ativo cadastrado.', colSpan: 3, alignment: 'center', color: '#94a3b8' }, '', '']]
              ),
            ],
          },
          layout: this.tableLayout(),
          margin: [0, 0, 0, 18],
        },
        ...(largest ? [
          { text: '3. Conclusão', style: 'section', margin: [0, 0, 0, 8] },
          {
            text: `O departamento com maior concentração de bens ativos é "${largest.name}", representando ${largest.percentage}% do total do patrimônio ativo da organização.`,
            style: 'obs',
          },
        ] : []),
      ];

    } else if (this.generatedReport === 'critical' && this.criticalData) {
      const d = this.criticalData;
      const assetTable = (rows: { tombamento: number; name: string; department: string }[], emptyMsg: string) => ({
        table: {
          headerRows: 1,
          widths: [80, '*', 140],
          body: [
            [
              { text: 'Tombamento', style: 'tableHeader' },
              { text: 'Bem Patrimonial', style: 'tableHeader' },
              { text: 'Departamento', style: 'tableHeader' },
            ],
            ...( rows.length
              ? rows.map(a => [`#${a.tombamento}`, a.name, a.department])
              : [[{ text: emptyMsg, colSpan: 3, alignment: 'center', color: '#94a3b8' }, '', '']]
            ),
          ],
        },
        layout: this.tableLayout(),
        margin: [0, 0, 0, 18],
      });

      content = [
        { text: 'STOK — Sistema de Gestão Patrimonial', style: 'org' },
        { text: 'Relatório de Bens em Situação Crítica', style: 'title' },
        { text: `Emitido em: ${now}`, style: 'emitted' },
        { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 1.5, lineColor: '#063b75' }] },
        { text: '1. Resumo', style: 'section', margin: [0, 18, 0, 8] },
        {
          columns: [
            this.kpiBlock('Em Manutenção', String(d.inMaintenance.length)),
            this.kpiBlock('Para Substituição', String(d.forReplacement.length)),
          ],
          columnGap: 10,
          margin: [0, 0, 0, 18],
        },
        { text: '2. Bens em Manutenção', style: 'section', margin: [0, 0, 0, 8] },
        assetTable(d.inMaintenance, 'Nenhum bem em manutenção.'),
        { text: '3. Bens para Substituição', style: 'section', margin: [0, 0, 0, 8] },
        assetTable(d.forReplacement, 'Nenhum bem para substituição.'),
        { text: '4. Recomendação', style: 'section', margin: [0, 0, 0, 8] },
        {
          text: `Recomenda-se a revisão imediata dos ${d.inMaintenance.length} bem(ns) atualmente em manutenção e a priorização de aquisições ou descarte dos ${d.forReplacement.length} bem(ns) identificados para substituição, a fim de preservar a integridade do patrimônio ativo.`,
          style: 'obs',
        },
      ];
    }

    const docDef: any = {
      pageSize: 'A4',
      pageMargins: [40, 48, 40, 48],
      content,
      styles: {
        org:         { fontSize: 8, bold: true, color: '#063b75', characterSpacing: 1, margin: [0, 0, 0, 4] },
        title:       { fontSize: 18, bold: true, color: '#0f172a', margin: [0, 0, 0, 4] },
        subtitle:    { fontSize: 11, color: '#475569', margin: [0, 0, 0, 2] },
        emitted:     { fontSize: 9, color: '#94a3b8', margin: [0, 0, 0, 6] },
        section:     { fontSize: 12, bold: true, color: '#0f172a' },
        tableHeader: { fontSize: 9, bold: true, color: '#475569', fillColor: '#f1f5f9', margin: [4, 6, 4, 6] },
        obs:         { fontSize: 10, color: '#475569', lineHeight: 1.6 },
      },
      defaultStyle: { font: 'Roboto', fontSize: 10, color: '#0f172a', lineHeight: 1.3 },
    };

    const fileName = `${fileNames[this.generatedReport!] ?? 'relatorio'}-${new Date().toISOString().slice(0,10)}.pdf`;
    pdfMake.createPdf(docDef).download(fileName);

    this.isExporting = false;
    this.cdr.detectChanges();
  }

  private kpiBlock(label: string, value: string): object {
    return {
      stack: [
        { text: label, fontSize: 8, bold: true, color: '#64748b', characterSpacing: 0.5, margin: [0, 0, 0, 4] },
        { text: value, fontSize: 20, bold: true, color: '#063b75' },
      ],
      margin: [0, 0, 0, 0],
    };
  }

  private tableLayout(): object {
    return {
      hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.headerRows) ? 1 : 0.5,
      vLineWidth: () => 0,
      hLineColor: (i: number) => i === 0 ? '#e2e8f0' : '#f1f5f9',
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    };
  }
}
