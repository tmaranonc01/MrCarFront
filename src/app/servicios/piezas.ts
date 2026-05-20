import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export type EstadoPieza = 'NUEVA' | 'REACONDICIONADA' | 'USADA';

export interface CocheRef {
  id: number;
  marca?: string;
  modelo?: string;
  anio?: number | null;
  motor?: string | null;
}

export interface Pieza {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  estado: EstadoPieza;
  imagenUrl?: string | null;
  coche?: CocheRef | null;
}

// Payload admin
export interface PiezaCrearActualizar {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  estado: EstadoPieza;
  imagenUrl?: string | null;
  coche: { id: number };
}

@Injectable({ providedIn: 'root' })
export class PiezasService {
  private publicUrl = '/api/piezas';
  private adminUrl = '/api/admin/piezas';

  constructor(private http: HttpClient) {}

  private withNoCache(url: string, forceRefresh: boolean): string {
    if (!forceRefresh) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}_=${Date.now()}`;
  }

  // Publico
  listar(forceRefresh = false): Observable<Pieza[]> {
    return this.http.get<Pieza[]>(this.withNoCache(this.publicUrl, forceRefresh));
  }

  detalle(id: number): Observable<Pieza> {
    return this.http.get<Pieza>(`${this.publicUrl}/${id}`);
  }

  // Admin
  adminListar(): Observable<Pieza[]> {
    // Compatibilidad con backends que no exponen GET en /admin/piezas.
    return this.http.get<Pieza[]>(this.withNoCache(this.adminUrl, true)).pipe(
      catchError((e: HttpErrorResponse) => {
        if (e.status === 403 || e.status === 405) {
          return this.listar(true);
        }
        return throwError(() => e);
      })
    );
  }

  adminCrear(p: PiezaCrearActualizar): Observable<Pieza> {
    return this.http.post<Pieza>(this.adminUrl, p);
  }

  adminActualizar(id: number, p: PiezaCrearActualizar): Observable<Pieza> {
    return this.http.put<Pieza>(`${this.adminUrl}/${id}`, p);
  }

  adminBorrar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
