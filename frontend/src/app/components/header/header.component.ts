
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'header-navbar',
    templateUrl:'./header.component.html'
})

export class HeaderComponent{

    @Output() featureSelected = new EventEmitter<string>();
    onSelect(feature: string){
    this.featureSelected.emit(feature)
    }
}
    
