import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryHome } from './inventory-home';

describe('InventoryHome', () => {
  let component: InventoryHome;
  let fixture: ComponentFixture<InventoryHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
