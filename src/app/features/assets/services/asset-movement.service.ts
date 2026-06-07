import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AssetMovement {
  id?: string;
  asset?: any;
  type: 'TRANSFERENCIA' | 'MANUTENCAO' | 'ESTADO';
  fromDepartment: string;
  toDepartment?: string;
  responsible: string;
  date: string;
  observations?: string;
  serviceOrder?: string;
  maintenanceType?: 'PREVENTIVA' | 'CORRETIVA' | 'PREDITIVA';
  serviceProvider?: string;
  sendDate?: string;
  expectedReturnDate?: string;
  estimatedCost?: number;
  finalCost?: number;
  problemDescription?: string;
  decommission?: boolean;
  newConservationStatus?: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'SUBSTITUIR';
  decommissionReason?: string;
  decommissionTerm?: string;
  alienationValue?: number;
  technicalOpinion?: string;
  finalDestination?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AssetMovementService {
  private apiUrl = 'http://localhost:8080/assets/movements';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AssetMovement[]> {
    return this.http.get<AssetMovement[]>(this.apiUrl);
  }

  getByAsset(assetId: string): Observable<AssetMovement[]> {
    return this.http.get<AssetMovement[]>(`${this.apiUrl}?assetId=${assetId}`);
  }

  findById(id: string): Observable<AssetMovement> {
    return this.http.get<AssetMovement>(`${this.apiUrl}/${id}`);
  }

  create(movement: AssetMovement): Observable<AssetMovement> {
    return this.http.post<AssetMovement>(this.apiUrl, movement);
  }
}
