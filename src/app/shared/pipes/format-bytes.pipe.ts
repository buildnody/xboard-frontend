import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatBytes',
  standalone: true,
})
export class FormatBytesPipe implements PipeTransform {
  transform(bytes: number | null | undefined, decimals = 2): string {
    if (bytes === null || bytes === undefined || bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
