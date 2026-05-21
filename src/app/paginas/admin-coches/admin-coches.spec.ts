import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { AdminCoches } from './admin-coches';

describe('AdminCoches', () => {
  let component: AdminCoches;
  let fixture: ComponentFixture<AdminCoches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCoches],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                coches: [{ id: 1, marca: 'Seat', modelo: 'Ibiza' }],
              },
            },
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCoches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
