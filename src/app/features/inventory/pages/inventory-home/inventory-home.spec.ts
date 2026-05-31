import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmoxarifadoHome } from './almoxarifado-home';

describe('AlmoxarifadoHome', () => {
  let component: AlmoxarifadoHome;
  let fixture: ComponentFixture<AlmoxarifadoHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlmoxarifadoHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmoxarifadoHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
