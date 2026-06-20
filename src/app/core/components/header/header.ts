import { Component, HostBinding, OnInit } from '@angular/core';
import { HeaderService, HeaderConfig } from '../../services/header';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private config: HeaderConfig | null = null;

  @HostBinding('style.display')
  get hostDisplay(): string {
    return this.config?.hidden ? 'none' : '';
  }

  constructor(public headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.config$.subscribe(c => this.config = c);
  }
}