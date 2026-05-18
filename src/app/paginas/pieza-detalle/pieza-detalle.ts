import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { PiezasService, Pieza } from '../../servicios/piezas';
import { DeseosService } from '../../servicios/deseos';
import { TokenService } from '../../servicios/token';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-pieza-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    ProgressSpinnerModule,
    DividerModule,
  ],
  templateUrl: './pieza-detalle.html',
})
export class PiezaDetalle implements OnInit {
  pieza: Pieza | null = null;
  cargando = false;
  error = '';
  cambiandoDeseo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private piezasService: PiezasService,
    private deseosService: DeseosService,
    public token: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.error = '';
    this.pieza = null;
    this.cargando = true;
    this.cdr.detectChanges(); // ✅ fuerza repintado

    if (!Number.isFinite(id) || id <= 0) {
      this.cargando = false;
      this.error = 'ID inválido';
      this.cdr.detectChanges();
      return;
    }

    this.piezasService
      .detalle(id)
      .pipe(
        timeout(8000),
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges(); // ✅ fuerza repintado al terminar
        })
      )
      .subscribe({
        next: (p) => {
          this.pieza = p;
          this.cdr.detectChanges(); // ✅ fuerza repintado al recibir datos
        },
        error: (e: any) => {
          this.error = `Error cargando detalle: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
          console.error(e);
          this.cdr.detectChanges();
        },
      });
  }

  volver() {
    this.router.navigateByUrl('/piezas');
  }

  agregarADeseos() {
    if (!this.pieza) return;

    if (!this.token.isLogged()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.cambiandoDeseo = true;
    this.cdr.detectChanges();

    this.deseosService
      .agregar(this.pieza.id)
      .pipe(finalize(() => {
        this.cambiandoDeseo = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {},
        error: (e) => console.error(e),
      });
  }

  severidadEstado(estado: Pieza['estado']) {
    if (estado === 'NUEVA') return 'success';
    if (estado === 'REACONDICIONADA') return 'info';
    return 'warn';
  }
}