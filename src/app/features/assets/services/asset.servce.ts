import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Asset {
  id?: string;
  tombamento?: number;
  name: string;
  specs?: string;
  brand: string;
  model: string;
  serialNumber?: string;
  category: string;
  conservationStatus: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'MANUTENCAO' | 'SUBSTITUIR';
  department: string;
  location?: string;
  responsible?: string;
  acquisitionDate: string;
  acquisitionValue: number;
  supplier?: any;
  nfNumber?: string;
  nfEmissionDate?: string;
  nfAccessKey?: string;
  warrantyUntil?: string;
  usefulLifeYears?: number;
  depreciationRate?: number;
  residualValue?: number;
  depreciationMethod?: 'LINEAR' | 'SOMA_DIGITOS' | 'UNIDADES_PRODUZIDAS';
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = 'http://localhost:8080/assets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }

  create(asset: Asset): Observable<Asset> {
    return this.http.post<Asset>(this.apiUrl, asset);
  }

  update(id: string, asset: Asset): Observable<Asset> {
    return this.http.put<Asset>(`${this.apiUrl}/${id}`, asset);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}