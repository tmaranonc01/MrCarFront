import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TokenService } from './servicios/token';
import { CochesService } from './servicios/coches';
import { DeseosService } from './servicios/deseos';
import { TagModule } from 'primeng/tag';
import { catchError, of, retry, throwError, timer } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, TagModule],
  templateUrl: './app.html',
})
export class App implements OnInit {
  constructor(
    public token: TokenService,
    private router: Router,
    private cochesApi: CochesService,
    private deseosApi: DeseosService
  ) {}

  ngOnInit() {
    // Despierta el backend tras inactividad para evitar "primer click sin datos".
    this.cochesApi.listar(true).subscribe({
      error: () => {
        // Silencioso: cada pantalla ya maneja sus propios reintentos.
      },
    });
  }

  async goDeseos() {
    // Un solo click: pre-carga/reintenta deseos antes de entrar.
    await firstValueFrom(
      this.deseosApi.listar().pipe(
        retry({
          count: 6,
          delay: (error: unknown, retryCount: number) => {
            const status = error instanceof HttpErrorResponse ? error.status : 0;
            const transient = status === 0 || status === 401 || status === 403 || status >= 500;
            if (!transient) return throwError(() => error);

            const waitMs = Math.min(700 + retryCount * 600, 3500);
            return timer(waitMs);
          },
        }),
        catchError(() => of([]))
      )
    );

    await this.router.navigateByUrl('/deseos').catch(() => false);
  }

  async logout() {
    this.token.clear();
    await this.router.navigateByUrl('/login').catch(() => false);
  }
}
