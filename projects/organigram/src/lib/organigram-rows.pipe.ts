import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'organigramRows' })
export class OrganigramRowsPipe implements PipeTransform {
  transform<T>(nodes: readonly T[], size = 5): T[][] {
    const rows: T[][] = [];
    for (let i = 0; i < nodes.length; i += size) rows.push(nodes.slice(i, i + size));
    return rows;
  }
}
