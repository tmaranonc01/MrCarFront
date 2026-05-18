import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { retryReadInterceptor } from './interceptors/retry-read.interceptor';

import { providePrimeNG } from 'primeng/config';
import nora from '@primeuix/themes/nora';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, retryReadInterceptor])),

    providePrimeNG({
      ripple: true,
      theme: { preset: nora }
    })
  ],
};
