import { Component } from '@angular/core';
import { HeaderService } from '../../services/header';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(public headerService: HeaderService) {}
}