/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'merge' })
export class MergePipe implements PipeTransform {
  transform<TObject, TSource>(obj: TObject, src?: TSource): TObject & TSource {
    return src ? { ...(obj as any), ...(src as any) } : { ...(obj as any) };
  }
}
