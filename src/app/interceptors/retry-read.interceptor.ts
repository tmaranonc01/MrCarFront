import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timeout, timer } from 'rxjs';

const READ_TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 250;

export const retryReadInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);

  return next(req).pipe(
    timeout({ first: READ_TIMEOUT_MS }),
    retry({
      count: 1,
      delay: (error: unknown) => {
        const isTimeout = (error as any)?.name === 'TimeoutError';
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const isTransient =
          isTimeout ||
          status === 0 ||
          status === 401 ||
          status === 403 ||
          status >= 500;

        return isTransient ? timer(RETRY_DELAY_MS) : throwError(() => error);
      },
    })
  );
};
