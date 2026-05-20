import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TokenService } from './servicios/token';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, TagModule],
  templateUrl: './app.html',
})
export class App {
goAutoDouble(arg0: string,$event: TouchEvent) {
throw new Error('Method not implemented.');
}
  private navBurstInProgress = false;
  private lastTouchNavTs = 0;

  constructor(public token: TokenService, private router: Router) {}

  private isSyntheticClickAfterTouch(event?: Event): boolean {
    if (!event) return false;

    const now = Date.now();
    if (event.type === 'touchend') {
      this.lastTouchNavTs = now;
      return false;
    }

    return event.type === 'click' && now - this.lastTouchNavTs < 700;
  }

  async goAutoDouble(url: string, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.isSyntheticClickAfterTouch(event)) return;
    if (this.navBurstInProgress) return;

    this.navBurstInProgress = true;
    try {
      // Primer intento de navegación.
      await this.router.navigateByUrl(url).catch(() => false);

      // Segundo intento automático (equivalente al segundo click manual).
      await new Promise(resolve => setTimeout(resolve, 80));
      if (this.router.url === url) {
        await this.router.navigateByUrl('/', { skipLocationChange: true }).catch(() => false);
      }
      await this.router
        .navigateByUrl(url, { onSameUrlNavigation: 'reload' })
        .catch(() => false);
    } finally {
      this.navBurstInProgress = false;
    }
  }

  async logout() {
    this.token.clear();
    await this.router.navigateByUrl('/login').catch(() => false);
  }
}
