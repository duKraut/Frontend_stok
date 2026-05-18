import { TestBed } from '@angular/core/testing';

import { Header } from './header';

describe('Header', () => {
  let service: Header;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Header);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
