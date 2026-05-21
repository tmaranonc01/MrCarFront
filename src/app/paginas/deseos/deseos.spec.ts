import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { Deseos } from './deseos';

describe('Deseos', () => {
  let component: Deseos;
  let fixture: ComponentFixture<Deseos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Deseos],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                deseos: [
                  {
                    id: 1,
                    pieza: { id: 10, nombre: 'Filtro', precio: 10, stock: 1, estado: 'USADA' },
                  },
                ],
              },
            },
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Deseos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
