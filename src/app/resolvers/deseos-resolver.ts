import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Deseo, DeseosService } from '../servicios/deseos';

const MAX_TRANSIENT_RETRIES = 6;
const MAX_EMPTY_RETRIES = 2;

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function isTransientStatus(status: number): boolean {
  return status === 0 || status === 401 || status === 403 || status >= 500;
}

export const deseosResolver: ResolveFn<Deseo[]> = async () => {
  const deseosApi = inject(DeseosService);

  let emptyRetries = 0;

  for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt++) {
    try {
      const data = (await firstValueFrom(deseosApi.listar())) ?? [];

      // Algunos despliegues "cold" devuelven vacio en el primer golpe.
      if (data.length === 0 && emptyRetries < MAX_EMPTY_RETRIES) {
        emptyRetries += 1;
        await wait(700 + emptyRetries * 500);
        continue;
      }

      return data;
    } catch (error: unknown) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      const transient = isTransientStatus(status);
      const canRetry = transient && attempt < MAX_TRANSIENT_RETRIES;

      if (!canRetry) return [];

      await wait(Math.min(900 + attempt * 650, 4000));
    }
  }

  return [];
};

