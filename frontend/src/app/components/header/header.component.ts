import { MapService } from 'src/app/services/map/map.service';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { Router } from '@angular/router';
import { Component, Output, EventEmitter, ViewChild, ElementRef, Renderer2, OnDestroy, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/session.service'


@Component({
    selector: 'header-navbar',
    templateUrl:'./header.component.html',
    styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnDestroy, OnInit{
    sessionState: any
    username: string
    link ='https://assets.webiconspng.com/uploads/2016/11/account_avatar_male_man_person_profile_user_icon_434194.png'

    private sessionState_sub: Subscription

    constructor(private sessionService:SessionService) {
        this.sessionState_sub = this.sessionService.sessionState.subscribe((username) => {
            this.sessionState = username
            if (username) {
                this.username = sessionStorage.getItem('username')
            } else {
                this.username = ''
            }
        })
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.sessionState_sub.unsubscribe()
    }
}
