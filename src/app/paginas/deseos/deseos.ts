import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DeseosService, Deseo } from '../../servicios/deseos';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-deseos',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './deseos.html',
})
export class Deseos implements OnInit {
  private readonly maxIntentosCarga = 4;

  deseos: Deseo[] = [];
  cargando = false;
  error = '';

  constructor(private deseosService: DeseosService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar(intento = 0) {
    this.error = '';
    if (intento === 0) this.cargando = true;

    this.deseosService
      .listar()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => (this.deseos = data ?? []),
        error: (e: any) => {
          const status = Number(e?.status ?? 0);
          const shouldRetry =
            intento < this.maxIntentosCarga &&
            (status === 0 || status === 401 || status === 403 || status >= 500);

          if (shouldRetry) {
            const waitMs = 300 + intento * 350;
            this.cargando = true;
            setTimeout(() => this.cargar(intento + 1), waitMs);
            return;
          }

          this.error = `Error cargando deseos: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
          console.error(e);
        },
      });
  }

  quitar(piezaId: number) {
    this.error = '';

    this.deseosService.quitar(piezaId).subscribe({
      next: () => {
        // quitamos en memoria sin recargar toda la página
        this.deseos = this.deseos.filter(d => d.pieza?.id !== piezaId);
      },
      error: (e: any) => {
        this.error = `Error quitando deseo: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
        console.error(e);
      },
    });
  }

  trackByDeseoId(_i: number, d: Deseo) {
    return d.id;
  }
}
