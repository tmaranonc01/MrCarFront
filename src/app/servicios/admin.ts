import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coche } from './coches';
import { EstadoPieza, Pieza } from './piezas';

export interface CocheCrear {
  marca: string;
  modelo: string;
  anio?: number;
  motor?: string;
}

export interface PiezaCrear {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  estado: EstadoPieza;
  imagenUrl?: string;
  cocheId: number; // 👈 en el front usamos cocheId, y lo convertimos al formato del back
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseAdmin = '/api/admin';

  constructor(private http: HttpClient) {}

  // ----- COCHES -----
  crearCoche(c: CocheCrear): Observable<Coche> {
    return this.http.post<Coche>(`${this.baseAdmin}/coches`, c);
  }

  actualizarCoche(id: number, c: CocheCrear): Observable<Coche> {
    return this.http.put<Coche>(`${this.baseAdmin}/coches/${id}`, c);
  }

  borrarCoche(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseAdmin}/coches/${id}`);
  }

  // ----- PIEZAS -----
  crearPieza(p: PiezaCrear): Observable<Pieza> {
    const body = {
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      estado: p.estado,
      imagenUrl: p.imagenUrl,
      coche: { id: p.cocheId } // ✅ ASÍ lo espera tu backend
    };
    return this.http.post<Pieza>(`${this.baseAdmin}/piezas`, body);
  }

  actualizarPieza(id: number, p: PiezaCrear): Observable<Pieza> {
    const body = {
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      estado: p.estado,
      imagenUrl: p.imagenUrl,
      coche: { id: p.cocheId }
    };
    return this.http.put<Pieza>(`${this.baseAdmin}/piezas/${id}`, body);
  }

  borrarPieza(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseAdmin}/piezas/${id}`);
  }
}
