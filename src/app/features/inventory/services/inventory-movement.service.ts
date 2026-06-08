import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryMovement {
  id?: string;
  item?: { id: string; name?: string; sku?: string; unit?: string };
  type: 'ENTRADA' | 'SAIDA';
  quantity: number;
  responsible: string;
  date: string;
  sector?: string;
  observations?: string;
  nfNumber?: string;
  nfEmissionDate?: string;
  nfAccessKey?: string;
  supplierName?: string;
  unitValue?: number;
  totalValue?: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryMovementService {
  private readonly base = 'http://localhost:8080/inventory/movements';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(this.base);
  }

  getByItem(itemId: string): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(`${this.base}?itemId=${itemId}`);
  }

  create(movement: Partial<InventoryMovement>): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(this.base, movement);
  }
}
