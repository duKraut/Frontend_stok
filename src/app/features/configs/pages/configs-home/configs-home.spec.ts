import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigsHome } from './configs-home';

describe('ConfigsHome', () => {
  let component: ConfigsHome;
  let fixture: ComponentFixture<ConfigsHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigsHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigsHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
