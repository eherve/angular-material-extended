/** @format */

import { Component, Input, ViewChild } from '@angular/core';
import {
  clone,
  deburr,
  each,
  filter,
  groupBy,
  includes,
  keys,
  map,
  meanBy,
  orderBy,
  slice,
  sumBy,
  toLower,
  trim,
  uniqBy,
} from 'lodash-es';
import moment from 'moment';
import { of } from 'rxjs';
import {
  NgxMatDatasourceResult,
  NgxMatDatasourceResultFacet,
  NgxMatDatasourceService,
  DatatableColumn,
  NgxMatDatatableOptions,
  NgxMatDatatableComponent,
} from '../../projects/datatable/src/public-api';
import { DatatableConfig } from '../../projects/datatable/src/lib/types/config.type';

moment.locale('fr');

const DATA: any[] = [];
let i = 0;
while (i++ < 100) {
  DATA.push({
    index: i,
    label: `Label ${i}`,
    embedded: {
      label: `Embedded label ${i}`,
    },
    number: i,
    float: Math.random() * i * 100,
    reference: `Référence ${i}`,
    checkbox: (() => {
      const rand = Math.random();
      return (
        rand < 0.33 ? true
        : rand < 0.66 ? false
        : undefined
      );
    })(),
    date: new Date(Date.now() + (Math.random() - 0.5) * 1000 * 60),
    duration:
      i < 3 ? 0 : (
        (moment
          .duration(moment().diff(moment().subtract(Math.random() * 1000 * 60 * 60 * 5, 'milliseconds')))
          .as('millisecond') as number)
      ),
    autocomplete: (() => {
      const rand = Math.round(Math.random() * 100);
      return `option ${rand}`;
    })(),
    template: `Template ${i}`,
    kind: ['kind 1', 'kind 2', 'kind 3', 'kind 4', 'kind 5'][i % 5],
    templateSearch: i,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    additionalProperty: `additionalProperty-${i}`,
  });
}

const service: NgxMatDatasourceService<any> = options => {
  let data = clone(DATA).filter(d => {
    for (let c of options.columns) {
      if (!c.search) continue;
      if (c.search.regex && !deburr(toLower(trim(d[c.data]))).includes(deburr(toLower(trim(c.search.value))))) {
        return false;
      }
      if (!c.search.regex) {
        if (c.search.operator === '$in') {
          if (!includes(c.search.value, d[c.data])) return false;
        } else if (d[c.data] !== c.search.value) return false;
      }
    }
    return true;
  });
  if (options.order) {
    data = orderBy(
      data,
      map(options.order, o => options.columns[o.column].data),
      map(options.order, 'dir')
    );
  }
  const recordsFiltered = data.length;

  const facets: { [id: string]: NgxMatDatasourceResultFacet[] } = {};
  each(options.facets, facet => {
    const f: NgxMatDatasourceResultFacet[] = (facets[facet.id] = []);
    const group = groupBy(data, facet.property);
    const groupKeys = keys(group);
    if (facet.operator === 'count') facets[facet.id] = map(groupKeys, _id => ({ _id, value: group[_id].length }));
    else if (facet.operator[0] === 'sum') {
      facets[facet.id] = map(groupKeys, _id => ({ _id, value: sumBy(group[_id], facet.operator[1]) }));
    } else if (facet.operator[0] === 'avg') {
      facets[facet.id] = map(groupKeys, _id => ({ _id, value: meanBy(group[_id], facet.operator[1]) }));
    }
  });

  data = data.slice(options.start! * options.length!, (options.start! + 1) * options.length!);
  console.log('service', options, data);
  return new Promise<NgxMatDatasourceResult<any>>(resolve => {
    setTimeout(() => resolve({ draw: options.draw, recordsTotal: DATA.length, recordsFiltered, data, facets }), 300);
  }).then(res => (console.log('res', res), res));
};

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild(NgxMatDatatableComponent)
  datatable?: NgxMatDatatableComponent;

  datatableOptions: NgxMatDatatableOptions<any> = {
    service,
    configService: {
      get: async () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              columns: this.datatableOptions.columns.map(c => ({
                columnDef: c.columnDef,
                sticky: c.sticky,
                hidden: c.hidden,
              })),
              pageSizeOptionsIndex: 0,
            });
          }, 1000);
        });
      },
      set: async (config: DatatableConfig) => {
        console.warn('configService set', config);
      },
    },
    pageSizeOptions: [10, 20, 50, 100],
    pageSizeOptionsIndex: 1,
    actions: {
      columns: {
        hideAndShow: true,
        sticky: true,
        reorder: true,
      },
      export: true,
      refresh: true,
      rowClick: row => console.log(row),
      user: [
        {
          position: 'start',
          kind: 'icon',
          icon: 'add',
          color: 'red',
          tooltip: 'test action start',
          onclick: datagrid => console.warn('user.start.add', datagrid),
        },
        {
          position: 'start',
          kind: 'template',
          contentId: 'action',
        },
        {
          position: 'center',
          kind: 'icon',
          icon: 'add',
          tooltip: 'test action center',
          onclick: datagrid => console.warn('user.center.add', datagrid),
        },
        {
          position: 'end',
          kind: 'icon',
          icon: 'add',
          tooltip: 'test action end',
          onclick: datagrid => console.warn('user.end.add', datagrid),
        },
      ],
    },
    facets: [
      {
        id: 'kind-count',
        position: 'start',
        kind: 'indicator',
        property: 'kind',
        operator: 'count',
        size: 80,
        options: [
          { value: 'kind 1', color: '#cbf078', labelColor: '#000000' },
          { value: 'kind 2', color: '#f8f398', labelColor: '#000000' },
          { value: 'kind 3', color: '#f1b963' },
          { value: 'kind 4', color: '#e46161' },
          { value: 'kind 5', color: '#0092ca' },
        ],
      },
      {
        id: 'kind-float-sum',
        name: 'Kind float sum',
        position: 'start',
        kind: 'indicator',
        display: 'chips',
        property: 'kind',
        operator: ['sum', 'float'],
        options: [
          { value: 'kind 1', color: '#cbf078', labelColor: '#000000', name: 'Kind - 1' },
          { value: 'kind 2', color: '#f8f398', labelColor: '#000000', name: 'Kind - 2' },
          { value: 'kind 3', color: '#f1b963', name: 'Kind - 3' },
          { value: 'kind 4', color: '#e46161', name: 'Kind - 4' },
          // { value: 'kind 5', color: '#0092ca', name: 'Kind - 5' },
        ],
      },
      {
        id: 'kind-float-avg',
        name: 'Kind float average',
        position: 'start',
        kind: 'indicator',
        property: 'kind',
        operator: ['avg', 'float'],
        contentId: 'kind-float-avg',
      },
    ],
    rowColor: 'green',
    rowBackgroundColor: column =>
      column.sticky ? undefined
      : column.type === 'duration' ? 'pink'
      : 'yellow',
    columnMinWith: 120,
    rowMaxHeight: 36,
    additionalProperties: ['additionalProperty'],
    columns: [
      {
        type: 'text',
        columnDef: 'label',
        header: 'Label',
        property: 'label',
        sticky: true,
        sortable: true,
        searchable: true,
        order: { index: 0, dir: 'asc' },
        prefix: 'Prefix&nbsp;',
        suffixContentId: 'suffix',
        tooltip: 'test tooltip',
      },
      {
        type: 'number',
        columnDef: 'number',
        header: 'Number',
        property: 'number',
        sticky: true,
        sortable: true,
        searchable: true,
        align: 'end',
        color: row => ['blue', 'green'][row.number % 2],
      },
      {
        type: 'number',
        columnDef: 'float',
        header: 'Float',
        property: 'float',
        format: '0.0-2',
        suffix: '<b>ml</b>',
        color: 'red',
        tooltip: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      },
      {
        type: 'text',
        columnDef: 'embedded-label',
        header: 'Embedded label',
        property: 'embedded.label',
        sortable: true,
        searchable: true,
      },
      {
        type: 'text',
        columnDef: 'kind',
        header: 'Kind',
        property: 'kind',
        sortable: true,
        searchable: true,
        searchUpdated: value => {
          console.log('column kind search', value);
        },
      },
      {
        type: 'date',
        columnDef: 'date',
        header: 'Date',
        property: 'date',
        searchable: true,
        format: 'L LT',
        placeholder: 'DD/MM/YYYY',
        withDuration: true,
        durationRefreshTime: 1000 * 5,
      },
      {
        type: 'duration',
        columnDef: 'duration',
        header: 'Durée',
        property: 'duration',
        align: 'center',
        searchable: true,
      },
      {
        type: 'select',
        columnDef: 'reference',
        header: 'Référence',
        property: 'reference',
        placeholder: 'Sélectionnez une référence',
        minWidth: 400,
        searchable: true,
        sortable: true,
        options: of(
          DATA.map(d => ({
            value: d.reference,
            name: d.reference.toUpperCase(),
            color: 'red',
            icon: 'home',
            iconColor: 'blue',
          }))
        ),
      },
      {
        type: 'select',
        columnDef: 'reference-m',
        header: 'Référence multiple',
        property: 'reference',
        placeholder: 'Sélectionnez une référence',
        minWidth: 400,
        searchable: true,
        sortable: true,
        multiple: true,
        options: of(
          DATA.map(d => ({
            value: d.reference,
            name: d.reference.toUpperCase(),
            color: 'red',
            icon: 'home',
            iconColor: 'blue',
          }))
        ),
      },
      {
        type: 'autocomplete',
        columnDef: 'autocomplete',
        header: 'Autocomplete',
        property: 'autocomplete',
        minWidth: 400,
        searchable: true,
        sortable: true,
        placeholder: 'Sélectionnez une option',
        loadOnFocus: true,
        options: async (limit, skip, search) => {
          return new Promise(resolve => {
            setTimeout(
              () =>
                resolve(
                  slice(
                    orderBy(
                      filter(
                        uniqBy(
                          map(DATA, d => ({
                            value: d.autocomplete,
                            name: d.autocomplete,
                            color: 'blue',
                            icon: 'home',
                            iconColor: 'red',
                          })),
                          'value'
                        ),
                        d => includes(d.value, search)
                      ),
                      ['label', 'asc']
                    ),
                    skip,
                    skip + limit
                  )
                ),
              500
            );
          });
        },
      },
      {
        type: 'checkbox',
        columnDef: 'checkbox',
        header: 'Checkbox',
        property: 'checkbox',
        searchable: true,
      },

      {
        type: 'text',
        columnDef: 'template',
        header: 'Template',
        property: 'template',
        searchable: true,
        searchProperty: 'templateSearch',
        sortable: true,
        sortProperty: 'templateSearch',
        cellContentId: 'test',
        cellComponent: ComponentCellComponent,
      },
      {
        type: 'text',
        columnDef: 'description',
        header: 'Description',
        property: 'description',
        minWidth: 400,
        cellContentId: 'description',
      },
      {
        columnDef: 'default',
        header: 'Default',
        property: 'label',
        minWidth: 400,
      },
    ],
  };

  // config:any;
  config = {
    columns: this.datatableOptions.columns
      .map(c => ({ columnDef: c.columnDef, sticky: c.sticky, hidden: c.hidden }))
      .reverse(),
    pageSizeOptionsIndex: 2,
  };

  constructor() {
    let i = 0;
    setInterval(() => {
      console.log('interval', i);
      this.datatableOptions.rowColor = ['green', 'red', 'black', 'blue'][++i % 4];
      each(this.datatable?.dataSource.data, v => (v.label = `changed by ${i}`));
      this.datatable?.redraw((record: any) => !(record.index % (i % 10)));
    }, 5000);
  }

  updatedConfig(config: DatatableConfig) {
    console.log('updatedConfig', config);
  }

  searchUpdated(search: any) {
    console.log('searchUpdated', search);
  }
}

@Component({
  template: '<span>Template component : {{value}}</span>',
  standalone: true,
})
export class ComponentCellComponent {
  @Input()
  column!: DatatableColumn<any>;

  @Input()
  row: any;

  @Input()
  value: any;
}
