import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'null'
})
export class NullPipe implements PipeTransform {

  transform(value: any, parent: any = true): any {
    if (!parent){
      return value
    }
    else{
      if (value[parent[0]]){
        return this.transform(value[parent[0]], parent.shift())
      }
      else{
        return "no result found"
      }
    }
  }
}
