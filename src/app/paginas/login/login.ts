import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../servicios/auth';
import { TokenService } from '../../servicios/token';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    DividerModule,
  ],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  cargando = false;
  error = '';

  constructor(private auth: AuthService, private token: TokenService, private router: Router) {}

  entrar() {
    this.error = '';

    const email = this.email.trim().toLowerCase();
    const password = this.password;

    if (!email || !password) {
      this.error = 'Email y contraseña son obligatorios.';
      return;
    }

    this.cargando = true;

    this.auth
      .login({ email, password })
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (res) => {
          this.token.setToken(res.token);
          this.router.navigateByUrl('/piezas');
        },
        error: (e: any) => {
          console.error(e);
          this.error = e?.status === 401 ? 'Credenciales incorrectas.' : 'Error al iniciar sesión.';
        },
      });
  }
}