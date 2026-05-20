import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { CochesService, Coche, CocheCrearActualizar } from '../../servicios/coches';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-admin-coches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    MessageModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-coches.html',
})
export class AdminCoches implements OnInit {
  private readonly maxIntentosCarga = 10;

  coches: Coche[] = [];
  cargando = false;
  error = '';

  dialogVisible = false;
  editandoId: number | null = null;

  form: CocheCrearActualizar = {
    marca: '',
    modelo: '',
    anio: null,
    motor: null,
  };

  constructor(private cochesApi: CochesService, private confirm: ConfirmationService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar(intento = 0) {
    this.error = '';
    if (intento === 0) this.cargando = true;

    this.cochesApi
      .adminListar()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => (this.coches = data ?? []),
        error: (e: any) => {
          const status = Number(e?.status ?? 0);
          const shouldRetry =
            intento < this.maxIntentosCarga &&
            (status === 0 || status === 401 || status === 403 || status >= 500);

          if (shouldRetry) {
            const waitMs = Math.min(1000 + intento * 700, 4500);
            this.cargando = true;
            setTimeout(() => this.cargar(intento + 1), waitMs);
            return;
          }

          this.error = `Error cargando coches: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
          console.error(e);
        },
      });
  }

  nuevo() {
    this.editandoId = null;
    this.form = { marca: '', modelo: '', anio: null, motor: null };
    this.dialogVisible = true;
  }

  editar(c: Coche) {
    this.editandoId = c.id;
    this.form = {
      marca: c.marca ?? '',
      modelo: c.modelo ?? '',
      anio: c.anio ?? null,
      motor: c.motor ?? null,
    };
    this.dialogVisible = true;
  }

  guardar() {
    this.error = '';

    const marca = (this.form.marca ?? '').trim();
    const modelo = (this.form.modelo ?? '').trim();

    if (!marca || !modelo) {
      this.error = 'Marca y modelo son obligatorios.';
      return;
    }

    const payload: CocheCrearActualizar = {
      marca,
      modelo,
      anio: this.form.anio ?? null,
      motor: (this.form.motor ?? '').trim() || null,
    };

    const req$ = this.editandoId
      ? this.cochesApi.adminActualizar(this.editandoId, payload)
      : this.cochesApi.adminCrear(payload);

    req$.subscribe({
      next: () => {
        this.dialogVisible = false;
        this.cargar();
      },
      error: (e: any) => {
        this.error = `Error guardando coche: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
        console.error(e);
      },
    });
  }

  confirmarBorrar(c: Coche) {
    this.confirm.confirm({
      header: 'Confirmar',
      message: `¿Seguro que quieres borrar ${c.marca} ${c.modelo}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Borrar',
      rejectLabel: 'Cancelar',
      accept: () => this.borrar(c.id),
    });
  }

  borrar(id: number) {
    this.error = '';

    this.cochesApi.adminBorrar(id).subscribe({
      next: () => this.cargar(),
      error: (e: any) => {
        this.error = `Error borrando coche: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
        console.error(e);
      },
    });
  }

  trackById(_i: number, c: Coche) {
    return c.id;
  }
}
