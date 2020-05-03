import { Router } from '@angular/router';
import { Component, Output, EventEmitter } from '@angular/core';
import { SessionService } from '../../services/session.service'


@Component({
    selector: 'header-navbar',
    templateUrl:'./header.component.html',
    styleUrls: ['./header.component.scss'],
})

export class HeaderComponent {
    sessionState: any
    username: string
    @Output() featureSelected = new EventEmitter<string>();
    
    constructor(private sessionService:SessionService) {
        this.sessionService.sessionState.subscribe((username) => {
            this.sessionState = username
            if (username) {
                this.username = sessionStorage.getItem('username')  
            } else {
                this.username = ''
            }            
        })
    }
}