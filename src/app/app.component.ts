/** @format */

import { Component, Input } from '@angular/core';
import { clone, deburr, filter, includes, map, orderBy, slice, toLower, trim, uniqBy } from 'lodash-es';
import { of } from 'rxjs';
import { DatasourceService, DatatableColumn, DatatableOptions } from '../../projects/datatable/src/public-api';
import moment from 'moment';

moment.locale('fr');

const DATA: any[] = [];
let i = 0;
while (i++ < 100) {
  DATA.push({
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
    date: new Date(Date.now() + (Math.random() - 0.5) * 1000 * 60 * 60 * 24 * 30),
    duration: moment
      .duration(moment().diff(moment().subtract(Math.random() * 1000 * 60 * 60, 'seconds')))
      .valueOf() as number,
    autocomplete: (() => {
      const rand = Math.round(Math.random() * 100);
      return `option ${rand}`;
    })(),
    template: `Template ${i}`,
    templateSearch: i,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  });
}

const service: DatasourceService<any> = options => {
  let data = clone(DATA).filter(d => {
    for (let c of options.columns) {
      if (!c.search) continue;
      if (c.search.regex && !deburr(toLower(trim(d[c.data]))).includes(deburr(toLower(trim(c.search.value))))) {
        return false;
      }
      if (!c.search.regex && d[c.data] !== c.search.value) return false;
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
  data = data.slice(options.start! * options.length!, (options.start! + 1) * options.length!);
  console.log('service', options, data);
  return new Promise(resolve => {
    setTimeout(() => resolve({ draw: options.draw, recordsTotal: DATA.length, recordsFiltered, data }), 300);
  });
};

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  datatableOptions: DatatableOptions<any> = {
    service,
    pageSizeOptions: [10, 20, 50, 100],
    pageSizeOptionsIndex: 1,
    actions: {
      // columns: {
      //   hideAndShow: true,
      //   sticky: true,
      //   reorder: true,
      // },
      refresh: true,
    },
    columnMinWith: 120,
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
      },
      {
        type: 'number',
        columnDef: 'number',
        header: 'Number',
        property: 'number',
        sticky: true,
        sortable: true,
        searchable: true,
      },
      {
        type: 'number',
        columnDef: 'float',
        header: 'Float',
        property: 'float',
        format: '0.0-2',
        suffix: '<b>ml</b>',
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
        type: 'date',
        columnDef: 'date',
        header: 'Date',
        property: 'date',
        searchable: true,
        format: 'L LT',
        placeholder: 'DD/MM/YYYY',
      },
      {
        type: 'duration',
        columnDef: 'duration',
        header: 'Durée',
        property: 'duration',
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
          DATA.map(d => ({ value: d.reference, name: d.reference, color: 'red', icon: 'home', iconColor: 'blue' }))
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
}

@Component({
  template: '<span>Template component : {{value}}</span>',
  standalone: true,
})
export class ComponentCellComponent {
  @Input()
  column!: DatatableColumn;

  @Input()
  row: any;

  @Input()
  value: any;
}
