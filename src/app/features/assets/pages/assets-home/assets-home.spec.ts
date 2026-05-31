import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatrimonioHome } from './patrimonio-home';

describe('PatrimonioHome', () => {
  let component: PatrimonioHome;
  let fixture: ComponentFixture<PatrimonioHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatrimonioHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatrimonioHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
