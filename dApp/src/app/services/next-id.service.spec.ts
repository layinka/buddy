import { TestBed } from '@angular/core/testing';

import { NextIdService } from './next-id.service';

describe('NextIdService', () => {
  let service: NextIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NextIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
