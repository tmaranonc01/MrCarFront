import { TestBed } from '@angular/core/testing';

import { Deseos } from '../paginas/deseos/deseos';

describe('Deseos', () => {
  let service: Deseos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Deseos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
