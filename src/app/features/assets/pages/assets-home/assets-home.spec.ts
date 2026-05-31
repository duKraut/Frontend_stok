import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsHome } from './assets-home';

describe('AssetsHome', () => {
  let component: AssetsHome;
  let fixture: ComponentFixture<AssetsHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetsHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
