import { TestBed } from '@angular/core/testing';

import { Piezas } from './piezas';

describe('Piezas', () => {
  let service: Piezas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Piezas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
