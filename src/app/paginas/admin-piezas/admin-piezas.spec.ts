import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPiezas } from './admin-piezas';

describe('AdminPiezas', () => {
  let component: AdminPiezas;
  let fixture: ComponentFixture<AdminPiezas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPiezas]
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
