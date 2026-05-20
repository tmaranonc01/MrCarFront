import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
  private readonly maxIntentosCarga = 10;
  private readonly maxIntentosVacio = 8;

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
      // Refuerzo: si el resolver no trajo datos, hacemos doble golpe automatico.
      this.cargar();
    }
  }

  private wait(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

  private isTransientStatus(status: number): boolean {
    return status === 0 || status === 401 || status === 403 || status >= 500;
  }

  private async listarUnaVez(): Promise<Deseo[]> {
    return (await firstValueFrom(this.deseosService.listar())) ?? [];
  }

  async cargar() {
    this.error = '';
    this.cargando = true;

    let vaciosSeguidos = 0;

    for (let intento = 0; intento <= this.maxIntentosCarga; intento++) {
      try {
        const primera = await this.listarUnaVez();
        if (primera.length > 0) {
          this.deseos = primera;
          this.cargando = false;
          return;
        }

        // Emula automaticamente el "segundo click".
        await this.wait(350);
        const segunda = await this.listarUnaVez();
        if (segunda.length > 0) {
          this.deseos = segunda;
          this.cargando = false;
          return;
        }

        vaciosSeguidos += 1;
        if (vaciosSeguidos > this.maxIntentosVacio) {
          this.deseos = [];
          this.cargando = false;
          return;
        }
      } catch (e: unknown) {
        const status = e instanceof HttpErrorResponse ? e.status : 0;
        const shouldRetry = intento < this.maxIntentosCarga && this.isTransientStatus(status);

        if (!shouldRetry) {
          const statusText = e instanceof HttpErrorResponse ? e.statusText : '';
          this.error = `Error cargando deseos: ${status} ${statusText}`.trim();
          this.cargando = false;
          console.error(e);
          return;
        }
      }

      await this.wait(Math.min(1000 + intento * 650, 4500));
    }

    this.cargando = false;
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
