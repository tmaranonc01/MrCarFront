import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { TokenService } from '../../servicios/token';
import { Coche, CochesService } from '../../servicios/coches';

type HomeCard = {
  titulo: string;
  texto: string;
  imagen: string;
};

type CocheOpcion = {
  id: number;
  label: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SelectModule, ButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  constructor(
    public token: TokenService,
    private cochesService: CochesService,
    private router: Router
  ) {}

  cochesOpciones: CocheOpcion[] = [];
  cocheSeleccionadoId: number | null = null;
  cargandoCoches = false;
  errorCoches = '';

  ngOnInit() {
    this.cargarCoches();
  }

  cargarCoches() {
    this.errorCoches = '';
    this.cargandoCoches = true;

    this.cochesService
      .listar()
      .pipe(finalize(() => (this.cargandoCoches = false)))
      .subscribe({
        next: (coches) => {
          this.cochesOpciones = (coches ?? []).map(c => ({
            id: c.id,
            label: this.etiquetaCoche(c),
          }));
        },
        error: (e: any) => {
          this.errorCoches = `Error cargando coches: ${e?.status ?? ''} ${e?.statusText ?? ''}`.trim();
          console.error(e);
        },
      });
  }

  irAPiezasDeCoche() {
    if (!this.cocheSeleccionadoId) return;

    const seleccionado = this.cochesOpciones.find(c => c.id === this.cocheSeleccionadoId);
    this.router.navigate(['/piezas'], {
      queryParams: {
        cocheId: this.cocheSeleccionadoId,
        coche: seleccionado?.label ?? '',
      },
    });
  }

  private etiquetaCoche(c: Coche) {
    const anio = c.anio ? ` (${c.anio})` : '';
    return `${c.marca} ${c.modelo}${anio}`;
  }

  cards: HomeCard[] = [
    {
      titulo: 'Frenos y seguridad',
      texto: 'Pastillas, discos y kits para mejorar la frenada y ganar confianza en carretera.',
      imagen:
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
    },
    {
      titulo: 'Rendimiento motor',
      texto: 'Componentes seleccionados para respuesta mas rapida y mayor fiabilidad.',
      imagen:
        'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80',
    },
    {
      titulo: 'Interior y confort',
      texto: 'Detalles que transforman la experiencia dentro del coche desde el primer minuto.',
      imagen:
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    },
  ];
}
