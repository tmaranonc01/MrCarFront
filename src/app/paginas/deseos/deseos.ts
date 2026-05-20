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
  deseos: Deseo[] = [];
  cargando = false;
  error = '';

  constructor(private deseosService: DeseosService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar(forceRefresh = false) {
    this.error = '';
    this.cargando = true;

    this.deseosService
      .listar()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => (this.deseos = data ?? []),
        error: (e: any) => {
          const status = Number(e?.status ?? 0);
          const shouldRetry = !forceRefresh && (status === 0 || status === 401 || status === 403);
          if (shouldRetry) {
            this.cargar(true);
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
