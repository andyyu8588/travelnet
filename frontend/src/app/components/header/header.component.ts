import { Component, Output, EventEmitter } from '@angular/core';
import{SessionService} from '../../services/session.service'
@Component({
    selector: 'header-navbar',
    templateUrl:'./header.component.html'
})

export class HeaderComponent{
    sessionState:any 
    @Output() featureSelected = new EventEmitter<string>();
    
    constructor(private sessionService:SessionService) {
        let x = this.sessionService.sessionState.subscribe(x => this.sessionState = x)
    }

    //select item from menu
    onSelect(feature: string) {
        this.featureSelected.emit(feature)
    }
}
    
