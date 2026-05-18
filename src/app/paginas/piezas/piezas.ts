import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PiezasService, Pieza } from '../../servicios/piezas';
import { DeseosService } from '../../servicios/deseos';
import { TokenService } from '../../servicios/token';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-piezas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './piezas.html',
})
export class Piezas implements OnInit {
  todasLasPiezas: Pieza[] = [];
  piezas: Pieza[] = [];
  cargando = false;
  error = '';

  // deseos
  deseosIds = new Set<number>();

  // filtro tabla
  filtroGlobal = '';
  cocheFiltroId: number | null = null;
  cocheFiltroNombre = '';

  constructor(
    private piezasService: PiezasService,
    private deseosService: DeseosService,
    public token: TokenService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  cargarPiezas() {
    this.error = '';
    this.cargando = true;

    this.piezasService
      .listar()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => {
          this.todasLasPiezas = data ?? [];
          this.aplicarFiltroCoche();
        },
        error: (e: any) => {
          this.error = `Error cargando piezas: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
          console.error(e);
        },
      });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const raw = params.get('cocheId');
      const id = raw ? Number(raw) : NaN;
      this.cocheFiltroId = Number.isFinite(id) && id > 0 ? id : null;
      this.cocheFiltroNombre = (params.get('coche') ?? '').trim();
      this.aplicarFiltroCoche();
    });

    this.cargarPiezas();
    this.cargarDeseosSiLogueado();
  }

  

  cargarDeseosSiLogueado() {
    this.deseosIds.clear();
    if (!this.token.isLogged()) return;

    this.deseosService.listar().subscribe({
      next: (lista) => {
        const set = new Set<number>();
        (lista ?? []).forEach(d => set.add(d.pieza.id));
        this.deseosIds = set;
      },
      error: (e: any) => console.error('Error cargando deseos', e),
    });
  }

  enDeseos(piezaId: number) {
    return this.deseosIds.has(piezaId);
  }

  agregarADeseos(piezaId: number) {
    if (!this.token.isLogged()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.deseosService.agregar(piezaId).subscribe({
      next: () => this.deseosIds.add(piezaId),
      error: (e: any) => console.error('Error agregar deseo', e),
    });
  }

  quitarDeDeseos(piezaId: number) {
    this.deseosService.quitar(piezaId).subscribe({
      next: () => this.deseosIds.delete(piezaId),
      error: (e: any) => console.error('Error quitar deseo', e),
    });
  }

  async limpiarFiltroCoche() {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cocheId: null, coche: null },
      queryParamsHandling: 'merge',
    }).catch(() => false);
  }

  private aplicarFiltroCoche() {
    if (!this.cocheFiltroId) {
      this.piezas = [...this.todasLasPiezas];
      return;
    }

    this.piezas = this.todasLasPiezas.filter(p => p.coche?.id === this.cocheFiltroId);

    if (!this.cocheFiltroNombre) {
      const match = this.todasLasPiezas.find(p => p.coche?.id === this.cocheFiltroId)?.coche;
      this.cocheFiltroNombre = match ? `${match.marca ?? ''} ${match.modelo ?? ''}`.trim() : '';
    }
  }

  trackById(_i: number, p: Pieza) {
    return p.id;
  }
}
