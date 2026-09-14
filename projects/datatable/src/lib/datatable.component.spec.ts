import { SecurityContext } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeHtml } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NgxMatDatatableComponent } from './datatable.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
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

  it('should toggle the expanded detail independently from the row click action', () => {
    const firstRow = { name: 'First' };
    const secondRow = { name: 'Second' };
    component.options.expandedDetailContentId = 'detail';
    const emitSpy = spyOn(component.rowClicked, 'emit');

    component.rowClick(firstRow);
    expect(component.expandedRow).toBe(firstRow);

    component.rowClick(secondRow);
    expect(component.expandedRow).toBe(secondRow);

    component.rowClick(secondRow);
    expect(component.expandedRow).toBeNull();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should activate an interactive row from the keyboard', () => {
    const row = { name: 'Keyboard row' };
    component.options.actions = { rowClick: true };
    const emitSpy = spyOn(component.rowClicked, 'emit');
    const preventDefault = jasmine.createSpy('preventDefault');

    component.rowKeydown({ key: 'Enter', preventDefault } as unknown as KeyboardEvent, row);

    expect(preventDefault).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledOnceWith(row);
  });

  it('should ignore keyboard activation when the row has no action', () => {
    const row = { name: 'Static row' };
    const emitSpy = spyOn(component.rowClicked, 'emit');
    const preventDefault = jasmine.createSpy('preventDefault');

    component.rowKeydown({ key: 'Enter', preventDefault } as unknown as KeyboardEvent, row);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should sanitize HTML before marking it as trusted', () => {
    const sanitizer = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', ['sanitize', 'bypassSecurityTrustHtml']);
    const trustedHtml = {} as SafeHtml;
    const html = '<strong>Safe</strong><script>alert("xss")</script>';
    sanitizer.sanitize.and.returnValue('<strong>Safe</strong>');
    sanitizer.bypassSecurityTrustHtml.and.returnValue(trustedHtml);
    const pipe = new SafeHtmlPipe(sanitizer);

    expect(pipe.transform(html)).toBe(trustedHtml);
    expect(sanitizer.sanitize).toHaveBeenCalledOnceWith(SecurityContext.HTML, html);
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledOnceWith('<strong>Safe</strong>');
  });

  it('should keep sanitized HTML cell bindings attached when content changes', async () => {
    const column = component.options.columns[0];
    Object.assign(column, { prefix: '<strong class="test-prefix">Before</strong>' });
    service.and.callFake(async request => ({
      draw: request.draw,
      recordsFiltered: 1,
      recordsTotal: 1,
      data: [{ name: 'Row' }],
    }));

    await component.loadPage();
    fixture.detectChanges();
    await fixture.whenStable();

    (component as any).renderRow(component.dataSource.data[0]);
    fixture.detectChanges();

    const getPrefix = (): HTMLElement | null => fixture.nativeElement.querySelector('.test-prefix');
    expect(getPrefix()?.textContent).toBe('Before');

    Object.assign(column, { prefix: '<strong class="test-prefix">After</strong>' });
    fixture.detectChanges();

    expect(getPrefix()?.textContent).toBe('After');
  });

  it('should render every cell in a row together after the row becomes visible', async () => {
    component.options.columns.push({
      type: 'text',
      columnDef: 'status',
      header: 'Status',
      property: 'status',
    });
    (component as any).buildDisplayColumns();
    const row: TestRecord = { name: 'Row', status: 'Active' };
    service.and.callFake(async request => ({
      draw: request.draw,
      recordsFiltered: 1,
      recordsTotal: 1,
      data: [row],
    }));

    await component.loadPage();
    expect((component as any).renderedRows.has(row)).toBeFalse();

    (component as any).renderRow(row);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((await fixture.getDeferBlocks()).length).toBe(0);
    const cellsAfterRender = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('td.mat-mdc-cell'));
    expect(cellsAfterRender[0].textContent).toContain('Row');
    expect(cellsAfterRender[1].textContent).toContain('Active');
  });


  it('should reload the first page when a column visibility changes', () => {
    component.openUpdateColumnDisplay();
    component.updateColumns[0].hidden = true;
    const loadFirstPageSpy = spyOn<any>(component, 'loadFirstPage');

    component.closeUpdateColumnDisplay();

    expect(component.options.columns[0].hidden).toBeTrue();
    expect(loadFirstPageSpy).toHaveBeenCalledTimes(1);
  });

  it('should render HTML headers for non-searchable columns', () => {
    component.options.columns[0].header = 'Compte sési<strong class="header-html">O</strong>';

    fixture.detectChanges();

    const headerHtml: HTMLElement | null = fixture.nativeElement.querySelector('.header-html');
    expect(headerHtml?.textContent).toBe('O');
  });

  it('should preserve disabled row state after redraw', () => {
    const row: TestRecord = { name: 'Disabled', disabled: true };
    component.options.rowDisabled = record => record.disabled === true;
    component.options.expandedDetailContentId = 'detail';
    component.dataSource.data = [row];
    component.disabledRows = [row];

    component.redraw();

    const redrawnRow = component.dataSource.data[0];
    expect(redrawnRow).not.toBe(row);
    expect(component.disabledRows).toEqual([redrawnRow]);
    const emitSpy = spyOn(component.rowClicked, 'emit');
    component.options.actions = { rowClick: true };
    component.rowClick(redrawnRow);
    expect(component.expandedRow).toBeNull();
    expect(emitSpy).not.toHaveBeenCalled();
  });

});
