import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CriticalAction } from '../../pages/dashboard-home/dashboard-home';

@Component({
  selector: 'app-action-list',
  standalone: false,
  templateUrl: './action-list.html',
  styleUrl: './action-list.css',
})
export class ActionList {
  @Input() actions: CriticalAction[] = [];
  @Output() actionClicked = new EventEmitter<CriticalAction>();

  readonly perPage = 4;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.actions.length / this.perPage);
  }

  get displayed(): CriticalAction[] {
    const start = (this.currentPage - 1) * this.perPage;
    return this.actions.slice(start, start + this.perPage);
  }

  get pageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  prev(): void { if (this.currentPage > 1) this.currentPage--; }
  next(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  goToPage(p: number): void { this.currentPage = p; }
}
