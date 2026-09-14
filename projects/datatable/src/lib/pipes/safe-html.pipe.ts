/** @format */

import { Pipe, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
})
export class SafeHtmlPipe {
  constructor(private sanitizer: DomSanitizer) {}

  transform(html: string | null | undefined): SafeHtml {
    const sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, html ?? '') ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
  }
}
