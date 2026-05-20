import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Coche {
  id: number;
  marca: string;
  modelo: string;
  anio?: number | null;
  motor?: string | null;
}

export interface CocheCrearActualizar {
  marca: string;
  modelo: string;
  anio?: number | null;
  motor?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CochesService {
  private publicUrl = '/api/coches';
  private adminUrl = '/api/admin/coches';

  constructor(private http: HttpClient) {}

  private withNoCache(url: string, forceRefresh: boolean): string {
    if (!forceRefresh) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}_=${Date.now()}`;
  }

  // Publico
  listar(forceRefresh = false): Observable<Coche[]> {
    return this.http.get<Coche[]>(this.withNoCache(this.publicUrl, forceRefresh));
  }

  detalle(id: number): Observable<Coche> {
    return this.http.get<Coche>(`${this.publicUrl}/${id}`);
  }

  // Admin
  adminListar(): Observable<Coche[]> {
    // En admin forzamos no-cache para evitar respuestas stale entre sesiones/roles.
    return this.http.get<Coche[]>(this.withNoCache(this.adminUrl, true));
  }

  adminCrear(c: CocheCrearActualizar): Observable<Coche> {
    return this.http.post<Coche>(this.adminUrl, c);
  }

  adminActualizar(id: number, c: CocheCrearActualizar): Observable<Coche> {
    return this.http.put<Coche>(`${this.adminUrl}/${id}`, c);
  }

  adminBorrar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
