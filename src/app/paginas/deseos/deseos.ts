import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  private readonly maxIntentosCarga = 8;
  private readonly maxIntentosVacio = 3;

  deseos: Deseo[] = [];
  cargando = false;
  error = '';

  constructor(
    private deseosService: DeseosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const resueltos = (this.route.snapshot.data['deseos'] as Deseo[] | undefined) ?? [];
    this.deseos = resueltos;

    if (resueltos.length === 0) {
      // Refuerzo: si el resolver no trajo datos por arranque en frio, reintenta aqui.
      this.cargar();
    }
  }

  cargar(intento = 0) {
    this.error = '';
    if (intento === 0) this.cargando = true;

    this.deseosService.listar().subscribe({
      next: (data) => {
        const lista = data ?? [];
        const shouldRetryEmpty = lista.length === 0 && intento < this.maxIntentosVacio;

        if (shouldRetryEmpty) {
          const waitMs = Math.min(900 + intento * 600, 2600);
          this.cargando = true;
          setTimeout(() => this.cargar(intento + 1), waitMs);
          return;
        }

        this.deseos = lista;
        this.cargando = false;
      },
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

        this.error = `Error cargando deseos: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
        this.cargando = false;
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
