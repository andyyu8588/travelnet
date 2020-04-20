import { Component, Output, EventEmitter } from '@angular/core';
import{SessionService} from '../../services/session.service'
@Component({
    selector: 'header-navbar',
    templateUrl:'./header.component.html'
})

export class HeaderComponent{
    session:boolean = this.sessionService.session()
    @Output() featureSelected = new EventEmitter<string>();
    
    constructor(private sessionService:SessionService) {

    }

    //select item from menu
    onSelect(feature: string) {
        this.featureSelected.emit(feature)
    }
}
    
