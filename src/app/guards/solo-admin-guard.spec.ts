import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { soloAdminGuard } from './solo-admin-guard';

describe('soloAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => soloAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
