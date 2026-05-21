import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PiezaDetalle } from './pieza-detalle';
import { PiezasService } from '../../servicios/piezas';
import { DeseosService } from '../../servicios/deseos';
import { TokenService } from '../../servicios/token';

describe('PiezaDetalle', () => {
  let component: PiezaDetalle;
  let fixture: ComponentFixture<PiezaDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiezaDetalle],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1' }) },
          },
        },
        {
          provide: PiezasService,
          useValue: {
            detalle: () => of({ id: 1, nombre: 'Filtro', precio: 10, stock: 1, estado: 'USADA' }),
          },
        },
        {
          provide: DeseosService,
          useValue: { agregar: () => of(void 0) },
        },
        {
          provide: TokenService,
          useValue: { isLogged: () => false },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiezaDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
