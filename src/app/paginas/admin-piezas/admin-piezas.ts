import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { PiezasService, Pieza, PiezaCrearActualizar, EstadoPieza } from '../../servicios/piezas';
import { CochesService, Coche } from '../../servicios/coches';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-admin-piezas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TagModule,
    MessageModule,
    ConfirmDialogModule,
    TextareaModule,
    SelectModule
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-piezas.html',
})
export class AdminPiezas implements OnInit {
  piezas: Pieza[] = [];
  coches: Coche[] = [];
  cochesOpciones: { label: string; value: number }[] = [];

  cargando = false;
  error = '';

  dialog = false;
  editandoId: number | null = null;

  estados: { label: string; value: EstadoPieza }[] = [
    { label: 'Nueva', value: 'NUEVA' },
    { label: 'Reacondicionada', value: 'REACONDICIONADA' },
    { label: 'Usada', value: 'USADA' },
  ];

  form = {
    nombre: '',
    descripcion: '',
    precio: 0,
    estado: 'USADA' as EstadoPieza,
    stock: 0,
    imagenUrl: '',
    cocheId: 0,
  };

  constructor(
    private piezasApi: PiezasService,
    private cochesApi: CochesService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit() {
    this.cargarTodo();
  }

  cargarTodo(forceRefresh = false) {
    this.error = '';
    this.cargando = true;

    forkJoin({
      piezas: this.piezasApi.adminListar(),
      coches: this.cochesApi.adminListar(),
    })
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: ({ piezas, coches }) => {
          this.piezas = piezas ?? [];
          this.coches = coches ?? [];
          this.cochesOpciones = this.coches.map(c => ({
            label: this.etiquetaCoche(c),
            value: c.id
          }));
        },
        error: (e: any) => {
          const status = Number(e?.status ?? 0);
          const shouldRetry = !forceRefresh && (status === 0 || status === 401 || status === 403);
          if (shouldRetry) {
            this.cargarTodo(true);
            return;
          }
          this.error = `Error cargando datos: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
          console.error(e);
        },
      });
  }

  etiquetaCoche(c: Coche) {
    const anio = c.anio ? ` (${c.anio})` : '';
    return `${c.marca} ${c.modelo}${anio}`;
  }

  nuevo() {
    this.editandoId = null;
    this.form = {
      nombre: '',
      descripcion: '',
      precio: 0,
      estado: 'USADA',
      stock: 0,
      imagenUrl: '',
      cocheId: this.coches[0]?.id ?? 0,
    };
    this.dialog = true;
  }

  editar(p: Pieza) {
    this.editandoId = p.id;
    this.form = {
      nombre: p.nombre ?? '',
      descripcion: p.descripcion ?? '',
      precio: Number(p.precio ?? 0),
      estado: p.estado,
      stock: Number(p.stock ?? 0),
      imagenUrl: p.imagenUrl ?? '',
      cocheId: p.coche?.id ?? 0,
    };
    this.dialog = true;
  }

  guardar() {
    const nombre = (this.form.nombre ?? '').trim();
    if (!nombre) {
      this.error = 'El nombre es obligatorio.';
      return;
    }
    if (!this.form.cocheId) {
      this.error = 'Selecciona un coche.';
      return;
    }

    const payload: PiezaCrearActualizar = {
      nombre,
      descripcion: (this.form.descripcion ?? '').trim() || null,
      precio: Number(this.form.precio ?? 0),
      estado: this.form.estado,
      stock: Number(this.form.stock ?? 0),
      imagenUrl: (this.form.imagenUrl ?? '').trim() || null,
      coche: { id: this.form.cocheId },
    };

    const req$ = this.editandoId
      ? this.piezasApi.adminActualizar(this.editandoId, payload)
      : this.piezasApi.adminCrear(payload);

    req$.subscribe({
      next: () => {
        this.dialog = false;
        this.cargarTodo();
      },
      error: (e: any) => {
        this.error = `Error guardando pieza: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
        console.error(e);
      },
    });
  }

  confirmarBorrar(p: Pieza) {
    this.confirm.confirm({
      message: `¿Borrar la pieza "${p.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Borrar',
      rejectLabel: 'Cancelar',
      accept: () => this.borrar(p.id),
    });
  }

  borrar(id: number) {
    this.piezasApi.adminBorrar(id).subscribe({
      next: () => this.cargarTodo(),
      error: (e: any) => {
        this.error = `Error borrando pieza: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
        console.error(e);
      },
    });
  }

  
  sevEstado(e: EstadoPieza) {
    if (e === 'NUEVA') return 'success';
    if (e === 'REACONDICIONADA') return 'info';
    return 'warn'; // USADA
  }

  trackById(_i: number, p: Pieza) {
    return p.id;
  }
}
