import { Component, Output, EventEmitter } from '@angular/core';
import { SessionService } from '../../services/session.service'

@Component({
    selector: 'header-navbar',
    templateUrl:'./header.component.html'
})

export class HeaderComponent {
    sessionState:any
    username: string
    @Output() featureSelected = new EventEmitter<string>();
    
    constructor(private sessionService:SessionService) {
        let x = this.sessionService.sessionState.subscribe(x => {
            this.sessionState = x
            if(x){
              this.username = sessionStorage.getItem('username')  
            } else {
                this.username = ''
            }
            
        })
    }

    // select item from menu
    onSelect(feature: string) {
        this.featureSelected.emit(feature)
    }
}
    
