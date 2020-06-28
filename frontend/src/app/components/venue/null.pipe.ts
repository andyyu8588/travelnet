import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'null'
})
export class NullPipe implements PipeTransform {

  transform(value: any, parent:any=false ): any {
    if (!parent.length){
      console.log('parent is empty')
      return value
    }
    else if(!parent){
      console.log('this never happens')
      return "no results found"
    }
    else{
      if (value[parent[0]]){
        console.log('parent is not empty')
        return this.transform(value[parent.shift()], parent)
      }
      else{
        console.log('we fucked up')
        return "no results found"
      }
    }
  }
}
