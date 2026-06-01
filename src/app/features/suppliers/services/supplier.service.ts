import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Supplier {
    code: string;
    name:string;
    document: string;
    category: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private apiUrl = 'http://localhost:8080/suppliers';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(this.apiUrl);
    }

    create(supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.post<Supplier>(this.apiUrl, supplier);
    }

    update(id: string, supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}