import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { DeseosService } from './deseos';

describe('DeseosService', () => {
  let service: DeseosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(DeseosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
