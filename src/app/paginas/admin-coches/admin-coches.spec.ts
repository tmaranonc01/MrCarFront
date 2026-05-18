import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCoches } from './admin-coches';

describe('AdminCoches', () => {
  let component: AdminCoches;
  let fixture: ComponentFixture<AdminCoches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCoches]
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
