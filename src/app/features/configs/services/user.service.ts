import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
  modules: string[];
}

export interface UserRequest {
  fullName: string;
  email: string;
  password?: string;
  role: string;
  department: string;
  active: boolean;
  modules: string[];
}

export interface UserSummary {
  id: string;
  fullName: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }

  getActive(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.API}/active`);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API}/${id}`);
  }

  create(req: UserRequest): Observable<User> {
    return this.http.post<User>(this.API, req);
  }

  update(id: string, req: UserRequest): Observable<User> {
    return this.http.put<User>(`${this.API}/${id}`, req);
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
