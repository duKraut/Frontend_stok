import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';
import { AssetService, Asset } from '../../../assets/services/asset.service';
import { AssetMovementService, AssetMovement } from '../../../assets/services/asset-movement.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).vfs;

interface MovRow {
  date: string; type: string; assetName: string;
  tombamento: number; department: string; toDepartment: string; responsible: string;
}

interface MovementsData {
  total: number; transfers: number; maintenances: number; decommissions: number;
  topDepartment: string; topDepartmentCount: number; rows: MovRow[];
}

interface DeptRow { name: string; count: number; value: number; percentage: number; }

interface DepartmentsData {
  totalAssets: number; totalValue: number; rows: DeptRow[];
}

interface AssetRow { tombamento: number; name: string; department: string; }

interface CriticalData {
  totalActive: number;
  inMaintenance: AssetRow[];
  forReplacement: AssetRow[];
}

@Component({
  selector: 'app-reports-home',
  standalone: false,
  templateUrl: './reports-home.html',
  styleUrl: './reports-home.css',
})
export class ReportsHome implements OnInit {
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
    private cdr: ChangeDetectorRef,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {
    this.headerService.setConfig({ showSearch: false, searchPlaceholder: '' });
  }

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
        next: (m) => this.processMovements(m),
        error: () => { this.isLoading = false; this.cdr.detectChanges(); }
      });
    } else if (this.selectedReport === 'departments') {
      this.assetService.getAll().subscribe({
        next: (a) => this.processDepartments(a),
        error: () => { this.isLoading = false; this.cdr.detectChanges(); }
      });
    } else {
      this.assetService.getAll().subscribe({
        next: (a) => this.processCritical(a),
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

    const deptCount: Record<string, number> = {};
    filtered.forEach(m => {
      const dept = m.fromDepartment || '—';
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });
    const topEntry = Object.entries(deptCount).sort(([, a], [, b]) => b - a)[0];

    this.movementsData = {
      total: filtered.length,
      transfers: filtered.filter(m => m.type === 'TRANSFERENCIA').length,
      maintenances: filtered.filter(m => m.type === 'MANUTENCAO').length,
      decommissions: filtered.filter(m => m.decommission === true).length,
      topDepartment: topEntry?.[0] ?? '—',
      topDepartmentCount: topEntry?.[1] ?? 0,
      rows: filtered.sort((a, b) => b.date.localeCompare(a.date)).map(m => ({
        date: m.date,
        type: this.getMovType(m),
        assetName: m.asset?.name ?? '—',
        tombamento: m.asset?.tombamento ?? 0,
        department: m.fromDepartment ?? '—',
        toDepartment: m.toDepartment ?? '',
        responsible: m.responsible ?? '—',
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
        .sort(([, a], [, b]) => b.count - a.count)
        .map(([name, d]) => ({
          name,
          count: d.count,
          value: d.value,
          percentage: active.length ? Math.round((d.count / active.length) * 100) : 0,
        }))
    };

    this.generatedReport = 'departments';
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private processCritical(assets: Asset[]): void {
    const active = assets.filter(a => a.active);
    const toRow = (a: Asset): AssetRow => ({
      tombamento: a.tombamento ?? 0, name: a.name, department: a.department
    });

    this.criticalData = {
      totalActive: active.length,
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
    return 'Alt. de Estado';
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
    const largest = this.departmentsData.rows[0];
    return { name: largest.name, percentage: largest.percentage };
  }

  printReport(): void {
    if (this.isExporting) return;
    this.isExporting = true;
    this.cdr.detectChanges();

    const now = this.today.toLocaleString('pt-BR');
    const LINE_W = 519;
    const fileNames: Record<string, string> = {
      movements: 'relatorio-movimentacoes',
      departments: 'relatorio-patrimonial',
      critical: 'relatorio-criticos',
    };

    const header = (title: string, subtitle?: string): any[] => [
      {
        columns: [
          { text: 'STOK', fontSize: 14, bold: true, color: '#063b75' },
          { text: 'Sistema de Gestão Patrimonial', fontSize: 8, color: '#64748b', alignment: 'right', margin: [0, 5, 0, 0] },
        ],
        margin: [0, 0, 0, 6],
      },
      { canvas: [{ type: 'rect', x: 0, y: 0, w: LINE_W, h: 2.5, color: '#063b75' }], margin: [0, 0, 0, 8] },
      { text: title, style: 'title' },
      ...(subtitle ? [{ text: subtitle, style: 'subtitle' }] : []),
    ];

    const sectionTitle = (num: string, text: string): any => ({
      columns: [
        { text: num, width: 18, fontSize: 9, bold: true, color: '#fff',
          background: '#063b75', alignment: 'center', margin: [0, 1, 0, 0] },
        { text: text, fontSize: 10, bold: true, color: '#0f172a', margin: [6, 0, 0, 0] },
      ],
      margin: [0, 14, 0, 8],
    });

    let content: any[] = [];

    /* ── RELATÓRIO 1: MOVIMENTAÇÕES ── */
    if (this.generatedReport === 'movements' && this.movementsData) {
      const d = this.movementsData;
      const pct = (n: number) => d.total > 0 ? `${Math.round((n / d.total) * 100)}%` : '0%';

      const obsText = d.total === 0
        ? `Não foram registradas movimentações patrimoniais no período de ${this.getMonthName(this.month)}/${this.year}.`
        : `No período de ${this.getMonthName(this.month)}/${this.year}, foram registradas ${d.total} movimentação(ões) patrimonial(is). ` +
          `As transferências representaram ${pct(d.transfers)} do volume total, ` +
          `as manutenções ${pct(d.maintenances)} e as baixas definitivas ${pct(d.decommissions)}. ` +
          (d.topDepartment !== '—'
            ? `O setor "${d.topDepartment}" concentrou o maior volume de atividade no período, com ${d.topDepartmentCount} registro(s), ` +
              `respondendo por ${Math.round((d.topDepartmentCount / d.total) * 100)}% das movimentações. `
            : '') +
          (d.decommissions > 0
            ? `Atenção: ${d.decommissions} baixa(s) definitiva(s) registrada(s) — avaliar necessidade de reposição patrimonial.`
            : 'Nenhuma baixa definitiva foi registrada no período.');

      content = [
        ...header('Relatório Mensal de Movimentações', `Período de referência: ${this.getMonthName(this.month)} de ${this.year}`),
        sectionTitle('1', 'Indicadores do Período'),
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: [[
              this.kpiCell('TOTAL DE MOVIMENTAÇÕES', String(d.total)),
              this.kpiCell('TRANSFERÊNCIAS', String(d.transfers), pct(d.transfers)),
              this.kpiCell('MANUTENÇÕES', String(d.maintenances), pct(d.maintenances)),
              this.kpiCell('BAIXAS', String(d.decommissions), pct(d.decommissions)),
            ]],
          },
          layout: this.kpiLayout(),
          margin: [0, 0, 0, 4],
        },
        ...(d.topDepartment !== '—' ? [{
          text: `Setor com maior atividade: ${d.topDepartment} (${d.topDepartmentCount} registros)`,
          fontSize: 8.5, color: '#475569', italics: true, margin: [0, 4, 0, 0],
        }] : []),
        sectionTitle('2', 'Detalhamento das Movimentações'),
        {
          table: {
            headerRows: 1,
            widths: [52, 62, '*', 90, 82],
            body: [
              [
                { text: 'DATA', style: 'th' },
                { text: 'TIPO', style: 'th' },
                { text: 'BEM PATRIMONIAL', style: 'th' },
                { text: 'ORIGEM', style: 'th' },
                { text: 'RESPONSÁVEL', style: 'th' },
              ],
              ...(d.rows.length
                ? d.rows.map(r => [
                    { text: this.formatDate(r.date), fontSize: 9 },
                    { text: r.type, fontSize: 9 },
                    { stack: [
                        { text: r.assetName, fontSize: 9, bold: true },
                        { text: `Tomb. #${r.tombamento}`, fontSize: 7.5, color: '#94a3b8' },
                      ]},
                    { text: r.toDepartment ? `${r.department} → ${r.toDepartment}` : r.department, fontSize: 8.5 },
                    { text: r.responsible, fontSize: 8.5 },
                  ])
                : [[{ text: 'Nenhuma movimentação registrada no período.', colSpan: 5, alignment: 'center', color: '#94a3b8', fontSize: 9, margin: [0, 8, 0, 8] }, '', '', '', '']]
              ),
            ],
          },
          layout: this.tableLayout(),
          margin: [0, 0, 0, 4],
        },
        sectionTitle('3', 'Análise Gerencial'),
        { text: obsText, style: 'obs' },
      ];

    /* ── RELATÓRIO 2: DEPARTAMENTOS ── */
    } else if (this.generatedReport === 'departments' && this.departmentsData) {
      const d = this.departmentsData;
      const top3 = d.rows.slice(0, 3);
      const bot3 = [...d.rows].slice(-Math.min(3, d.rows.length)).reverse();
      const largest = d.rows[0];
      const smallest = d.rows[d.rows.length - 1];

      const obsText = d.totalAssets === 0
        ? 'Não há bens ativos cadastrados no sistema.'
        : `A análise da distribuição patrimonial evidencia que o departamento "${largest?.name}" ` +
          `concentra ${largest?.percentage}% dos bens ativos e ${this.formatCurrency(largest?.value ?? 0)} em valor de aquisição, ` +
          `configurando-se como o setor de maior representatividade patrimonial da organização. ` +
          (d.rows.length > 1
            ? `O setor "${smallest?.name}" apresenta a menor concentração, com ${smallest?.count} bem(ns) (${smallest?.percentage}% do total). `
            : '') +
          `O valor patrimonial total de ${this.formatCurrency(d.totalValue)} está distribuído entre ${d.rows.length} departamento(s) ativo(s). ` +
          `Recomenda-se revisão periódica da política de distribuição de ativos para garantir equilíbrio operacional entre os setores.`;

      content = [
        ...header('Relatório Patrimonial por Departamento'),
        sectionTitle('1', 'Indicadores Gerais'),
        {
          table: {
            widths: ['*', '*'],
            body: [[
              this.kpiCell('TOTAL DE BENS ATIVOS', String(d.totalAssets)),
              this.kpiCell('VALOR PATRIMONIAL TOTAL', this.formatCurrency(d.totalValue)),
            ]],
          },
          layout: this.kpiLayout(),
          margin: [0, 0, 0, 4],
        },
        sectionTitle('2', 'Ranking por Departamento'),
        {
          table: {
            headerRows: 1,
            widths: [22, '*', 60, 90, 55],
            body: [
              [
                { text: '#', style: 'th', alignment: 'center' },
                { text: 'DEPARTAMENTO', style: 'th' },
                { text: 'QTDE.', style: 'th', alignment: 'right' },
                { text: 'VALOR TOTAL (R$)', style: 'th', alignment: 'right' },
                { text: 'PART. %', style: 'th', alignment: 'right' },
              ],
              ...(d.rows.length
                ? d.rows.map((r, i) => [
                    { text: String(i + 1), alignment: 'center', fontSize: 9, color: '#94a3b8' },
                    { text: r.name, fontSize: 9, bold: i === 0 },
                    { text: String(r.count), alignment: 'right', fontSize: 9 },
                    { text: this.formatCurrency(r.value), alignment: 'right', fontSize: 9 },
                    { text: `${r.percentage}%`, alignment: 'right', fontSize: 9, bold: i === 0, color: i === 0 ? '#063b75' : '#0f172a' },
                  ])
                : [[{ text: 'Nenhum bem ativo cadastrado.', colSpan: 5, alignment: 'center', color: '#94a3b8', fontSize: 9 }, '', '', '', '']]
              ),
            ],
          },
          layout: this.tableLayout(),
          margin: [0, 0, 0, 4],
        },
        sectionTitle('3', 'Análise Gerencial'),
        { text: obsText, style: 'obs' },
      ];

    /* ── RELATÓRIO 3: CRÍTICOS ── */
    } else if (this.generatedReport === 'critical' && this.criticalData) {
      const d = this.criticalData;
      const total = d.totalActive;
      const critical = d.inMaintenance.length + d.forReplacement.length;
      const critPct = total > 0 ? ((critical / total) * 100).toFixed(1) : '0';
      const maintPct = total > 0 ? ((d.inMaintenance.length / total) * 100).toFixed(1) : '0';
      const replPct  = total > 0 ? ((d.forReplacement.length / total) * 100).toFixed(1) : '0';

      const critTable = (rows: AssetRow[], priority: string, emptyMsg: string): any => ({
        table: {
          headerRows: 1,
          widths: [70, '*', 130, 70],
          body: [
            [
              { text: 'TOMBAMENTO', style: 'th' },
              { text: 'BEM PATRIMONIAL', style: 'th' },
              { text: 'DEPARTAMENTO', style: 'th' },
              { text: 'PRIORIDADE', style: 'th', alignment: 'center' },
            ],
            ...(rows.length
              ? rows.map(a => [
                  { text: `#${a.tombamento}`, fontSize: 9, bold: true, color: '#475569' },
                  { text: a.name, fontSize: 9 },
                  { text: a.department, fontSize: 9 },
                  { text: priority, fontSize: 8, bold: true, alignment: 'center',
                    color: priority === 'CRÍTICA' ? '#dc2626' : '#d97706' },
                ])
              : [[{ text: emptyMsg, colSpan: 4, alignment: 'center', color: '#94a3b8', fontSize: 9, margin: [0, 8, 0, 8] }, '', '', '']]
            ),
          ],
        },
        layout: this.tableLayout(),
        margin: [0, 0, 0, 4],
      });

      const obsText = critical === 0
        ? `Nenhum bem em situação crítica foi identificado. O patrimônio ativo de ${total} bem(ns) encontra-se em estado satisfatório de conservação.`
        : `O patrimônio ativo apresenta ${critical} bem(ns) (${critPct}% do total) em situação crítica. ` +
          `Destes, ${d.inMaintenance.length} (${maintPct}%) encontram-se em manutenção — ` +
          `prioridade ALTA — e ${d.forReplacement.length} (${replPct}%) necessitam de substituição imediata — ` +
          `prioridade CRÍTICA. Recomenda-se acionar os responsáveis de cada setor para elaboração de ` +
          `plano de ação, contemplando previsão orçamentária para reposição dos bens classificados como ` +
          `"Para Substituição" e acompanhamento dos prazos de retorno das manutenções em aberto.`;

      content = [
        ...header('Relatório de Bens em Situação Crítica'),
        sectionTitle('1', 'Indicadores de Criticidade'),
        {
          table: {
            widths: ['*', '*', '*'],
            body: [[
              this.kpiCell('BENS EM SITUAÇÃO CRÍTICA', String(critical), `${critPct}% do patrimônio ativo`),
              this.kpiCell('EM MANUTENÇÃO', String(d.inMaintenance.length), `${maintPct}% — Prioridade: Alta`),
              this.kpiCell('PARA SUBSTITUIÇÃO', String(d.forReplacement.length), `${replPct}% — Prioridade: Crítica`),
            ]],
          },
          layout: this.kpiLayout(),
          margin: [0, 0, 0, 4],
        },
        { text: `Base de análise: ${total} bens ativos no patrimônio.`,
          fontSize: 8.5, color: '#475569', italics: true, margin: [0, 4, 0, 0] },
        sectionTitle('2', 'Bens em Manutenção'),
        critTable(d.inMaintenance, 'ALTA', 'Nenhum bem em manutenção.'),
        sectionTitle('3', 'Bens para Substituição'),
        critTable(d.forReplacement, 'CRÍTICA', 'Nenhum bem para substituição.'),
        sectionTitle('4', 'Recomendação Gerencial'),
        { text: obsText, style: 'obs' },
      ];
    }

    const nowStr = now;
    const docDef: any = {
      pageSize: 'A4',
      pageMargins: [32, 44, 32, 52],
      content,
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: 'STOK — Sistema de Gestão Patrimonial', fontSize: 7.5, color: '#94a3b8', margin: [32, 10, 0, 0] },
          { text: `Emitido em: ${nowStr}`, fontSize: 7.5, color: '#94a3b8', alignment: 'center', margin: [0, 10, 0, 0] },
          { text: `Página ${currentPage} de ${pageCount}`, fontSize: 7.5, color: '#94a3b8', bold: true, alignment: 'right', margin: [0, 10, 32, 0] },
        ],
      }),
      styles: {
        title:     { fontSize: 15, bold: true, color: '#0f172a', margin: [0, 0, 0, 4] },
        subtitle:  { fontSize: 9.5, color: '#475569', margin: [0, 0, 0, 0] },
        th:        { fontSize: 7.5, bold: true, color: '#475569', fillColor: '#f1f5f9', margin: [4, 5, 4, 5] },
        obs:       { fontSize: 9, color: '#334155', lineHeight: 1.65 },
      },
      defaultStyle: { font: 'Roboto', fontSize: 9, color: '#0f172a', lineHeight: 1.35 },
    };

    const fileName = `${fileNames[this.generatedReport!] ?? 'relatorio'}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdfMake.createPdf(docDef).download(fileName);

    this.isExporting = false;
    this.cdr.detectChanges();
  }

  private kpiCell(label: string, value: string, sub?: string): object {
    return {
      stack: [
        { text: value, fontSize: 23, bold: true, color: '#063b75', lineHeight: 1, margin: [0, 0, 0, 3] },
        { text: label, fontSize: 6.5, bold: true, color: '#64748b', characterSpacing: 0.4 },
        ...(sub ? [{ text: sub, fontSize: 7, color: '#94a3b8', margin: [0, 2, 0, 0] }] : []),
      ],
      fillColor: '#f8fafc',
      border: [false, true, true, false],
      borderColor: ['', '#063b75', '#e2e8f0', ''],
      margin: [14, 14, 14, 16],
    };
  }

  private kpiLayout(): object {
    return {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    };
  }

  private tableLayout(): object {
    return {
      hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.headerRows) ? 1 : 0.5,
      vLineWidth: () => 0,
      hLineColor: (i: number) => i === 0 ? '#cbd5e1' : '#f1f5f9',
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    };
  }
}
