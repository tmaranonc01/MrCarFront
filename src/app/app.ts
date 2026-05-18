import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { TokenService } from './servicios/token';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToolbarModule, TagModule],
  templateUrl: './app.html',
})
export class App {
  constructor(public token: TokenService, private router: Router) {}

  async go(url: string) {
    if (this.router.url === url) return;

    const ok = await this.router.navigateByUrl(url).catch(() => false);
    if (ok) return;

    // Fallback: algunas navegaciones se cancelan en el primer intento.
    await Promise.resolve();
    await this.router.navigateByUrl(url).catch(() => false);
  }

  async logout() {
    this.token.clear();
    await this.router.navigateByUrl('/login').catch(() => false);
  }
}
