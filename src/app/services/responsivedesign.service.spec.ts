import { TestBed } from '@angular/core/testing';

import { ResponsivedesignService } from './responsivedesign.service';

describe('ResponsivedesignService', () => {
  let service: ResponsivedesignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsivedesignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
