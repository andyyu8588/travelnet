import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'null'
})
export class NullPipe implements PipeTransform {

  transform(value: any, parent:any=false ): any {
    if (!parent.length){
      return value
    }
    else if(!parent){
      return "no results found"
    }
    else{
      if (value[parent[0]]){
        return this.transform(value[parent.shift()], parent)
      }
      else{
        return "no results found"
      }
    }
  }
}
