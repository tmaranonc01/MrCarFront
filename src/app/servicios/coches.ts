import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

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
    // Compatibilidad con backends que no exponen GET en /admin/coches.
    return this.http.get<Coche[]>(this.withNoCache(this.adminUrl, true)).pipe(
      catchError((e: HttpErrorResponse) => {
        if (e.status === 403 || e.status === 405) {
          return this.listar(true);
        }
        return throwError(() => e);
      })
    );
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
