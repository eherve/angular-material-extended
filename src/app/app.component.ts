import { Component } from '@angular/core';
import { clone, filter, map, orderBy, uniqBy, includes, slice } from 'lodash-es';
import { of } from 'rxjs';
import { MongooseDatatableOptions } from '../../projects/mongoose-datatable/src/public-api';

const DATA: any[] = [];
let i = 0;
while (i++ < 100) {
  DATA.push({
    label: `Label ${i}`,
    reference: `Référence ${i}`,
    checkbox: (() => {
      const rand = Math.random();
      return rand < 0.33 ? true : rand < 0.66 ? false : undefined;
    })(),
    autocomplete: (() => {
      const rand = Math.round(Math.random() * 100);
      return `option ${rand}`;
    })(),
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  });
}

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  datatableOptions: MongooseDatatableOptions<any> = {
    service: (options) => {
      let data = clone(DATA);
      if (options.order) {
        data = orderBy(
          data,
          map(options.order, (o) => options.columns[o.column].data),
          map(options.order, 'dir')
        );
      }
      data = data.slice(options.start! * options.length!, (options.start! + 1) * options.length!);
      console.log('service', options, data);
      return new Promise((resolve) => {
        setTimeout(() => resolve({ draw: options.draw, recordsTotal: 100, recordsFiltered: 100, data }), 300);
      });
    },
    pageSizeOptions: [10, 20, 50, 100],
    pageSizeOptionsIndex: 1,
    actions: {
      columns: {
        hideAndShow: true,
        sticky: true,
        reorder: true,
      },
      refresh: true,
    },
    columnMinWith: 120,
    columns: [
      {
        columnDef: 'label',
        header: 'Label',
        property: 'label',
        sticky: true,
        sortable: true,
        searchable: 'text',
        order: { index: 0, dir: 'asc' },
      },
      {
        columnDef: 'reference',
        header: 'Référence',
        property: 'reference',
        minWidth: 400,
        sortable: true,
        searchable: 'select',
        options: of(
          DATA.map((d) => ({ value: d.reference, label: d.reference, color: 'red', icon: 'home', iconColor: 'blue' }))
        ),
      },
      {
        columnDef: 'autocomplete',
        header: 'Autocomplete',
        property: 'autocomplete',
        minWidth: 400,
        sortable: true,
        searchable: 'autocomplete',
        placeholder: 'Sélectionnez une option',
        loadOnFocus: true,
        options: async (limit, skip, search) => {
          return new Promise((resolve) => {
            setTimeout(
              () =>
                resolve(
                  slice(
                    orderBy(
                      filter(
                        uniqBy(
                          map(DATA, (d) => ({
                            value: d.autocomplete,
                            label: d.autocomplete,
                            color: 'blue',
                            icon: 'home',
                            iconColor: 'red',
                          })),
                          'value'
                        ),
                        (d) => includes(d.value, search)
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
        columnDef: 'checkbox',
        header: 'Checkbox',
        property: 'checkbox',
        searchable: 'checkbox',
      },
      {
        columnDef: 'description',
        header: 'Description',
        property: 'description',
        minWidth: 400,
      },
    ],
  };
}
