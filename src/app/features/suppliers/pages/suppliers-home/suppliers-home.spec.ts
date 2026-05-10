import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersHome } from './suppliers-home';

describe('SuppliersHome', () => {
  let component: SuppliersHome;
  let fixture: ComponentFixture<SuppliersHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuppliersHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliersHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
