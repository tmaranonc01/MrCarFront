import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiezaDetalle } from './pieza-detalle';

describe('PiezaDetalle', () => {
  let component: PiezaDetalle;
  let fixture: ComponentFixture<PiezaDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiezaDetalle]
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
