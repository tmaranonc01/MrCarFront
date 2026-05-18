import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pieza } from './piezas';
import { TokenService } from './token';

export interface Deseo {
  id: number;
  creadoEn?: string;
  pieza: Pieza;
}

@Injectable({ providedIn: 'root' })
export class DeseosService {
  private baseUrl = '/api/deseos';

  constructor(private http: HttpClient, private token: TokenService) {}

  private paramsConEmailSiExiste(): HttpParams | undefined {
    const email = this.token.getEmail?.() ?? null;
    if (!email) return undefined;
    return new HttpParams().set('email', email.trim().toLowerCase());
  }

  listar(): Observable<Deseo[]> {
    const params = this.paramsConEmailSiExiste();
    return this.http.get<Deseo[]>(this.baseUrl, params ? { params } : {});
  }

  agregar(piezaId: number): Observable<void> {
    const params = this.paramsConEmailSiExiste();
    // body null para no liarla con content-type
    return this.http.post<void>(`${this.baseUrl}/${piezaId}`, null, params ? { params } : {});
  }

  quitar(piezaId: number): Observable<void> {
    const params = this.paramsConEmailSiExiste();
    return this.http.delete<void>(`${this.baseUrl}/${piezaId}`, params ? { params } : {});
  }
}