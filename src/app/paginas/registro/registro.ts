import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../servicios/auth';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-registro',
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
  templateUrl: './registro.html',
})
export class Registro {
  email = '';
  password = '';
  password2 = '';
  cargando = false;
  error = '';
  ok = '';

  constructor(private auth: AuthService, private router: Router) {}

  registrar() {
    this.error = '';
    this.ok = '';

    const email = this.email.trim().toLowerCase();
    const p1 = this.password;
    const p2 = this.password2;

    if (!email || !p1 || !p2) {
      this.error = 'Rellena todos los campos.';
      return;
    }
    if (p1.length < 4) {
      this.error = 'La contraseña es demasiado corta.';
      return;
    }
    if (p1 !== p2) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;

    this.auth
      .registro({ email, password: p1 })
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: () => {
          this.ok = 'Usuario creado. Ya puedes iniciar sesión.';
          // opcional: redirigir al login tras 1s
          setTimeout(() => this.router.navigateByUrl('/login'), 800);
        },
        error: (e: any) => {
          console.error(e);
          this.error = e?.status === 409 ? 'Ese email ya existe.' : 'Error creando usuario.';
        },
      });
  }
}