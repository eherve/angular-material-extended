import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NgxMatDatatableComponent } from './datatable.component';
import { NgxMatDatasourceService } from './types/datasource-service.type';

type TestRecord = { name: string; disabled?: boolean; status?: string | string[] };

describe('NgxMatDatatableComponent', () => {
  let component: NgxMatDatatableComponent<TestRecord>;
  let fixture: ComponentFixture<NgxMatDatatableComponent<TestRecord>>;
  let service: jasmine.Spy<NgxMatDatasourceService<TestRecord>>;

  beforeEach(async () => {
    service = jasmine.createSpy<NgxMatDatasourceService<TestRecord>>('service').and.resolveTo({
      draw: '1',
      recordsFiltered: 0,
      recordsTotal: 0,
      data: [],
    });

    await TestBed.configureTestingModule({
      imports: [NgxMatDatatableComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxMatDatatableComponent<TestRecord>);
    component = fixture.componentInstance;
    component.options = {
      service,
      columns: [
        {
          type: 'text',
          columnDef: 'name',
          header: 'Name',
          property: 'name',
        },
      ],
    };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the datasource without loading before intersection', () => {
    expect(component.dataSource).toBeTruthy();
    expect(service).not.toHaveBeenCalled();
  });

  it('should preserve projection expressions and page-index pagination in the request contract', async () => {
    const projection = { $size: { $ifNull: ['$items', []] } };
    component.options.columns = [
      {
        type: 'number',
        columnDef: 'itemCount',
        header: 'Items',
        property: 'itemCount',
        projection,
      },
    ];
    component.paginator!.pageIndex = 3;
    component.paginator!.pageSize = 25;

    await component.loadPage();

    const request = service.calls.mostRecent().args[0];
    expect(request.columns[0].projection).toEqual(projection);
    expect(request.start).toBe(3);
    expect(request.length).toBe(25);
  });

  it('should not emit rowClicked when rowClick is false', () => {
    const row = { name: 'Test' };
    component.options.actions = { rowClick: false };
    const emitSpy = spyOn(component.rowClicked, 'emit');

    component.rowClick(row);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit rowClicked when rowClick is true', () => {
    const row = { name: 'Test' };
    component.options.actions = { rowClick: true };
    const emitSpy = spyOn(component.rowClicked, 'emit');

    component.rowClick(row);

    expect(emitSpy).toHaveBeenCalledOnceWith(row);
  });

  it('should preserve disabled row state after redraw', () => {
    const row: TestRecord = { name: 'Disabled', disabled: true };
    component.options.rowDisabled = record => record.disabled === true;
    component.dataSource.data = [row];
    component.disabledRows = [row];

    component.redraw();

    const redrawnRow = component.dataSource.data[0];
    expect(redrawnRow).not.toBe(row);
    expect(component.disabledRows).toEqual([redrawnRow]);
    const emitSpy = spyOn(component.rowClicked, 'emit');
    component.options.actions = { rowClick: true };
    component.rowClick(redrawnRow);
    expect(emitSpy).not.toHaveBeenCalled();
  });

});
