import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

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
  private readonly maxIntentosVacio = 8;

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

  constructor(
    private cochesApi: CochesService,
    private confirm: ConfirmationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const resueltos = (this.route.snapshot.data['coches'] as Coche[] | undefined) ?? [];
    this.coches = resueltos;

    if (resueltos.length === 0) {
      this.cargar();
    }
  }

  private wait(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

  private isTransientStatus(status: number): boolean {
    return status === 0 || status === 401 || status === 403 || status >= 500;
  }

  private idsCoinciden(a: unknown, b: unknown): boolean {
    return String(a ?? '') === String(b ?? '');
  }

  private async listarUnaVez(): Promise<Coche[]> {
    return (await firstValueFrom(this.cochesApi.adminListar())) ?? [];
  }

  async cargar(idBorradoEsperado?: number) {
    this.error = '';
    this.cargando = true;
    let vaciosSeguidos = 0;
    const esperandoBorrado = typeof idBorradoEsperado === 'number';
    const contieneBorradoEsperado = (lista: Coche[]) =>
      esperandoBorrado && lista.some(c => this.idsCoinciden(c.id, idBorradoEsperado));

    for (let intento = 0; intento <= this.maxIntentosCarga; intento++) {
      try {
        const primera = await this.listarUnaVez();
        if (primera.length > 0 && !contieneBorradoEsperado(primera)) {
          this.coches = primera;
          this.cargando = false;
          return;
        }
        if (primera.length === 0 && esperandoBorrado) {
          this.coches = [];
          this.cargando = false;
          return;
        }

        // Emula automaticamente el "segundo click".
        await this.wait(350);
        const segunda = await this.listarUnaVez();
        if (segunda.length > 0 && !contieneBorradoEsperado(segunda)) {
          this.coches = segunda;
          this.cargando = false;
          return;
        }
        if (segunda.length === 0 && esperandoBorrado) {
          this.coches = [];
          this.cargando = false;
          return;
        }

        vaciosSeguidos += 1;
        if (!esperandoBorrado && vaciosSeguidos > this.maxIntentosVacio) {
          this.coches = [];
          this.cargando = false;
          return;
        }
      } catch (e: unknown) {
        const status = e instanceof HttpErrorResponse ? e.status : 0;
        const shouldRetry = intento < this.maxIntentosCarga && this.isTransientStatus(status);

        if (!shouldRetry) {
          const statusText = e instanceof HttpErrorResponse ? e.statusText : '';
          this.error = `Error cargando coches: ${status} ${statusText}`.trim();
          this.cargando = false;
          console.error(e);
          return;
        }
      }

      await this.wait(Math.min(1000 + intento * 650, 4500));
    }

    this.cargando = false;
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
      next: () => {
        this.coches = this.coches.filter(c => !this.idsCoinciden(c.id, id));
        window.location.reload();
      },
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
