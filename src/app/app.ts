import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TokenService } from './servicios/token';
import { CochesService } from './servicios/coches';
import { TagModule } from 'primeng/tag';

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
    private cochesApi: CochesService
  ) {}

  ngOnInit() {
    // Despierta el backend tras inactividad para evitar "primer click sin datos".
    this.cochesApi.listar(true).subscribe({
      error: () => {
        // Silencioso: cada pantalla ya maneja sus propios reintentos.
      },
    });
  }

  async logout() {
    this.token.clear();
    await this.router.navigateByUrl('/login').catch(() => false);
  }
}
