import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Piezas } from './piezas';
import { PiezasService } from '../../servicios/piezas';
import { DeseosService } from '../../servicios/deseos';
import { TokenService } from '../../servicios/token';

describe('Piezas', () => {
  let component: Piezas;
  let fixture: ComponentFixture<Piezas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Piezas],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
            snapshot: { data: {} },
          },
        },
        {
          provide: PiezasService,
          useValue: { listar: () => of([]) },
        },
        {
          provide: DeseosService,
          useValue: {
            listar: () => of([]),
            agregar: () => of(void 0),
            quitar: () => of(void 0),
          },
        },
        {
          provide: TokenService,
          useValue: { isLogged: () => false },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Piezas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
