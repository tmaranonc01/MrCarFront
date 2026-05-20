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
  constructor(public token: TokenService, private router: Router) {}

  async logout() {
    this.token.clear();
    await this.router.navigateByUrl('/login').catch(() => false);
  }
}
