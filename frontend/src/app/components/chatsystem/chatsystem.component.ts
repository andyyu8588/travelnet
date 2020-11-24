import { Subscription } from 'rxjs'
import { SessionService } from './../../services/session.service'
import { FriendlistService } from 'src/app/services/chatsystem/friendlist.service'
import { Component, OnInit, OnDestroy } from '@angular/core'

@Component({
  selector: 'app-chatsystem',
  templateUrl: './chatsystem.component.html',
  styleUrls: ['./chatsystem.component.scss']
})
export class ChatsystemComponent implements OnInit, OnDestroy {

  sessionState: boolean
  user = sessionStorage.getItem('username')
  openChatWidgets: any

  private openChatWidgets_sub: Subscription
  private sessionState_sub: Subscription

  constructor(
    private FriendlistService: FriendlistService,
    private SessionService: SessionService){

    this.SessionService.session()

    this.openChatWidgets_sub = this.FriendlistService.openWidgets.subscribe(x => {
      this.openChatWidgets = x
    })
    this.sessionState_sub = this.SessionService.sessionState.subscribe(x => {
      this.sessionState = x
    })
  }

  ngOnInit() {
    this.FriendlistService.getNotifications()
  }

  refreshRoom(roomId: string) {
    this.FriendlistService.selectChatwidget(roomId)
  }

  ngOnDestroy() {
    this.openChatWidgets_sub.unsubscribe()
    this.sessionState_sub.unsubscribe()
  }
}
