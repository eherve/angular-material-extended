import { TestBed } from '@angular/core/testing';

import { MongooseDatatableService } from './mongoose-datatable.service';

describe('MongooseDatatableService', () => {
  let service: MongooseDatatableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MongooseDatatableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
