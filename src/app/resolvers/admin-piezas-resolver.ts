import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Coche, CochesService } from '../servicios/coches';
import { Pieza, PiezasService } from '../servicios/piezas';

export type AdminPiezasResolvedData = {
  piezas: Pieza[];
  coches: Coche[];
};

const MAX_TRANSIENT_RETRIES = 6;
const MAX_EMPTY_RETRIES = 3;

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function isTransientStatus(status: number): boolean {
  return status === 0 || status === 401 || status === 403 || status >= 500;
}

async function listarUnaVez(
  piezasApi: PiezasService,
  cochesApi: CochesService
): Promise<AdminPiezasResolvedData> {
  const [piezas, coches] = await Promise.all([
    firstValueFrom(piezasApi.adminListar()),
    firstValueFrom(cochesApi.adminListar()),
  ]);

  return {
    piezas: piezas ?? [],
    coches: coches ?? [],
  };
}

export const adminPiezasResolver: ResolveFn<AdminPiezasResolvedData> = async () => {
  const piezasApi = inject(PiezasService);
  const cochesApi = inject(CochesService);

  let emptyRetries = 0;

  for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt++) {
    try {
      const primera = await listarUnaVez(piezasApi, cochesApi);
      if (primera.piezas.length > 0 || primera.coches.length > 0) return primera;

      // Emula automaticamente el "segundo click".
      await wait(350);
      const segunda = await listarUnaVez(piezasApi, cochesApi);
      if (segunda.piezas.length > 0 || segunda.coches.length > 0) return segunda;

      if (emptyRetries < MAX_EMPTY_RETRIES) {
        emptyRetries += 1;
        await wait(700 + emptyRetries * 500);
        continue;
      }

      return { piezas: [], coches: [] };
    } catch (error: unknown) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      const transient = isTransientStatus(status);
      const canRetry = transient && attempt < MAX_TRANSIENT_RETRIES;

      if (!canRetry) return { piezas: [], coches: [] };

      await wait(Math.min(900 + attempt * 650, 4000));
    }
  }

  return { piezas: [], coches: [] };
};

