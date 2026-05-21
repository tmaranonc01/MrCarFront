import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { AdminPiezas } from './admin-piezas';

describe('AdminPiezas', () => {
  let component: AdminPiezas;
  let fixture: ComponentFixture<AdminPiezas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPiezas],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                adminPiezas: {
                  piezas: [{ id: 1, nombre: 'Filtro', precio: 10, stock: 2, estado: 'USADA' }],
                  coches: [{ id: 1, marca: 'Seat', modelo: 'Ibiza' }],
                },
              },
            },
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPiezas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
