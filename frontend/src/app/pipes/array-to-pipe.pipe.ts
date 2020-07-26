import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayToPipe'
})
export class ArrayToPipePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return Array(value).fill(args[0])
  }

}
