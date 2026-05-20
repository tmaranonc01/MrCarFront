import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { PiezasService } from './piezas';

describe('PiezasService', () => {
  let service: PiezasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(PiezasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
