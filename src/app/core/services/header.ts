import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface HeaderConfig {
  searchPlaceholder: string;
  showSearch: boolean;
  primaryButtonLabel?: string;
  primaryButtonIcon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private configSubject = new BehaviorSubject<HeaderConfig>({
    searchPlaceholder: 'Buscar...',
    showSearch: true
  });

  config$ = this.configSubject.asObservable();

  setConfig(config: HeaderConfig): void {
    this.configSubject.next(config);
  }
}