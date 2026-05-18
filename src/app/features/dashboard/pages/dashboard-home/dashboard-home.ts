import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HeaderService } from '../../../../core/services/header';

@Component({
  selector: 'app-dashboard-home',
  standalone: false,
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome implements OnInit{
  
  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.setConfig({
      searchPlaceholder: '',
      showSearch: false
    });
  }
}
