import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface HeaderConfig {
  searchPlaceholder: string;
  showSearch: boolean;
  hidden?: boolean;
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

  private searchSubject = new BehaviorSubject<string>('');

  config$ = this.configSubject.asObservable();
  search$ = this.searchSubject.asObservable();

  setConfig(config: HeaderConfig): void {
    this.configSubject.next(config);
    this.searchSubject.next('');
  }

  setSearch(term: string): void {
    this.searchSubject.next(term);
  }
}
