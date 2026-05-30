import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: false,
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() accentColor: 'warning' | 'danger' | '' = '';
  @Input() badgeText: string = '';
  @Input() badgeColor: 'success' | 'neutral' = 'neutral';
  @Input() iconClass: string = '';
  @Input() iconColor: string = '';
}
