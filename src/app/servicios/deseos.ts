import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pieza } from './piezas';

export interface Deseo {
  id: number;
  creadoEn?: string;
  pieza: Pieza;
}

@Injectable({ providedIn: 'root' })
export class DeseosService {
  private baseUrl = '/api/deseos';

  constructor(private http: HttpClient) {}

  private withNoCache(url: string, forceRefresh: boolean): string {
    if (!forceRefresh) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}_=${Date.now()}`;
  }

  listar(): Observable<Deseo[]> {
    // En datos por usuario forzamos no-cache para evitar primera respuesta stale.
    return this.http.get<Deseo[]>(this.withNoCache(this.baseUrl, true));
  }

  agregar(piezaId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${piezaId}`, null);
  }

  quitar(piezaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${piezaId}`);
  }
}
