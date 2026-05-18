import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { soloLogueadoGuard } from './solo-logueado-guard';

describe('soloLogueadoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => soloLogueadoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
