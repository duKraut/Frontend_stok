import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItem {
  id?: string;
  codigo?: number;
  name: string;
  brand?: string;
  category: string;
  location?: string;
  description?: string;
  unit: string;
  minStock: number;
  currentStock?: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly base = 'http://localhost:8080/inventory/items';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.base);
  }

  getById(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.base}/${id}`);
  }

  create(item: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.base, item);
  }

  update(id: string, item: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.base}/${id}`, item);
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
