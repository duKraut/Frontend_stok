import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-searchable-select',
  standalone: false,
  templateUrl: './searchable-select.html',
  styleUrl: './searchable-select.css',
})
export class SearchableSelect implements OnChanges {
  @Input() options: any[] = [];
  @Input() displayFn: (option: any) => string = (o) => String(o);
  @Input() selectedId = '';
  @Output() selectedIdChange = new EventEmitter<string>();
  @Input() valueFn: (option: any) => string = (o) => o.id;
  @Input() disabled = false;
  @Input() placeholder = 'Pesquisar...';
  @Input() errorClass = false;

  searchText = '';
  isOpen = false;
  filteredOptions: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.filteredOptions = this.options;
    }
    if (changes['selectedId'] || changes['options']) {
      this.syncDisplayText();
    }
  }

  private syncDisplayText(): void {
    if (!this.selectedId) {
      this.searchText = '';
      return;
    }
    const found = this.options.find(o => this.valueFn(o) === this.selectedId);
    this.searchText = found ? this.displayFn(found) : this.selectedId;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value;
    const lower = value.toLowerCase();
    this.filteredOptions = this.options.filter(o =>
      this.displayFn(o).toLowerCase().includes(lower)
    );
    this.isOpen = true;
  }

  onFocus(): void {
    if (this.disabled) return;
    this.filteredOptions = this.searchText
      ? this.options.filter(o => this.displayFn(o).toLowerCase().includes(this.searchText.toLowerCase()))
      : this.options;
    this.isOpen = true;
  }

  onBlur(): void {
    setTimeout(() => {
      this.isOpen = false;
      this.syncDisplayText();
      this.cdr.detectChanges();
    }, 150);
  }

  select(option: any): void {
    const value = this.valueFn(option);
    this.selectedId = value;
    this.selectedIdChange.emit(value);
    this.searchText = this.displayFn(option);
    this.isOpen = false;
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedId = '';
    this.selectedIdChange.emit('');
    this.searchText = '';
    this.filteredOptions = this.options;
    this.isOpen = true;
  }
}
