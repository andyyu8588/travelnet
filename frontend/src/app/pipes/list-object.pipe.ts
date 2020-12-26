import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'listObject'
})
export class ListObjectPipe implements PipeTransform {

  transform(value: {[key: string]: any}, ...args: unknown[]): unknown {
    return null
  }

}
