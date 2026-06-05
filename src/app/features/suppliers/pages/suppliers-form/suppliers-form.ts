import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Supplier, SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-suppliers-form',
  standalone: false,
  templateUrl: './suppliers-form.html',
  styleUrl: './suppliers-form.css',
})
export class SuppliersForm implements OnChanges {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() supplier: Supplier | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  formData = {
    personType: 'PJ' as 'PF' | 'PJ', 
    name: '',
    document: '',
    category: 'Papelaria',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    neighborhood: '',
    active: true
  };

  constructor(private supplierService: SupplierService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.supplier && (this.mode === 'edit' || this.mode === 'view')) {
      this.formData = {
        personType: this.supplier.personType ?? 'PJ',
        name: this.supplier.name,
        document: this.supplier.document,
        category: this.supplier.category,
        contactName: this.supplier.contactName ?? '',
        email: this.supplier.email ?? '',
        phone: this.supplier.phone ?? '',
        address: this.supplier.address ?? '',
        zipCode: this.supplier.zipCode ?? '',
        city : this.supplier.city ?? '',
        neighborhood: this.supplier.neighborhood ?? '',
        active: this.supplier.active
      };
      return;
    }

    if (this.mode === 'create') {
      this.formData = {
        personType: 'PJ',
        name: '',
        document: '',
        category: 'Papelaria',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        zipCode: '',
        city: '',
        neighborhood: '',
        active: true
      };
    }
  }

  changePersonType(type: 'PF' | 'PJ'): void {
    this.formData.personType = type;
    this.formData.document = '';

    if (type === 'PF') {
      this.formData.contactName = '';
    }
  }

  saveSupplier(): void {
    if (this.mode === 'create') {
      this.supplierService.create(this.formData).subscribe({
        next: () => {
          this.saved.emit();
          this.closeDrawer();
        },
        error: (error) => console.error('Erro ao criar fornecedor', error)
      });
      return;
    }

    if (this.mode === 'edit' && this.supplier?.id) {
      this.supplierService.update(this.supplier.id, this.formData).subscribe({
        next: () => {
          this.saved.emit();
          this.closeDrawer();
        },
        error: (error) => console.error('Erro ao atualizar fornecedor', error)
      });
    }
  }

  onlyNumbers(value: string): string {
    return value.replace(/\D/g, '');
  }

  formatDocument(): void {
    const numbers = this.onlyNumbers(this.formData.document ?? '');

    if (this.formData.personType === 'PF') {
      this.formData.document = numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      return;
    }

    this.formData.document = numbers
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  formatPhone(): void {
    const numbers = this.onlyNumbers(this.formData.phone ?? '').slice(0, 11);

    this.formData.phone = numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }

  formatZipCode(): void {
    const numbers = this.onlyNumbers(this.formData.zipCode ?? '').slice(0, 8);

    this.formData.zipCode = numbers.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
  }

  closeDrawer(): void {
    this.close.emit();
  }
}