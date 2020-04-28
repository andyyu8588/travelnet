import { SessionService } from './../../services/session.service';
import { FriendlistService } from 'src/app/services/friendlist.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chatsystem',
  templateUrl: './chatsystem.component.html',
  styleUrls: ['./chatsystem.component.scss']
})
export class ChatsystemComponent implements OnInit {

  sessionState: boolean
  user = sessionStorage.getItem('username')
  openChatWidgets: any

  constructor(
    private FriendlistService: FriendlistService,
    private SessionService: SessionService,){
    
    console.log(`windows ${window.innerWidth}`)

    this.SessionService.session()

    let openChatWidgets_sub = this.FriendlistService.openWidgets.subscribe(x => this.openChatWidgets = x)
    let y = this.SessionService.sessionState.subscribe(x => { this.sessionState = x })
  }

  ngOnInit() {
    this.FriendlistService.getNotifications()
  }

  refreshRoom(roomId: string) {
    this.FriendlistService.selectChatwidget(roomId)
  }
}
