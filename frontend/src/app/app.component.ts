import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/chatsystem/socket.service';
import { SessionService } from './services/session.service';
import { Component, DoCheck, OnInit, OnDestroy } from '@angular/core';
import { FriendlistService } from './services/chatsystem/friendlist.service';
import { MapService } from './services/map/map.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements DoCheck, OnInit, OnDestroy {

  title = 'frontend';
  windowHeight: number
  user = sessionStorage.getItem('username')
  openChatWidgets: any
  private openChatWidgetsSub: Subscription
  sessionState: boolean
  private sessionStateSub: Subscription

  constructor(
    private FriendlistService: FriendlistService,
    private SessionService: SessionService,
    private SocketService: SocketService,
    private MapService: MapService){

    // check if logged in from other tab (if LocalStorage exist)
    localStorage.getItem('username')?
    this.SocketService.emit('updateLogin', {username: localStorage.getItem('username')}, (data) => {
      if(data.res){
        sessionStorage.setItem('username', data.res)
        SessionService.session()
      } else if (data.err){
        console.log(data.err)
        localStorage.clear()
        sessionStorage.clear()
        SessionService.session()
      }
    })
    : {}

    // calling observables
    this.openChatWidgetsSub = this.FriendlistService.openWidgets.subscribe(x => this.openChatWidgets = x)
    this.sessionStateSub = this.SessionService.sessionState.subscribe(x => {
      this.sessionState = x
      if (this.sessionState) {
        // this.FriendlistService.getNotifications()
      }
    })
  }

  ngOnInit() {
    // this.FriendlistService.getNotifications()
  }

  ngDoCheck() {
    // console.log(this.sessionState)
  }

  resizeWindow(){
    this.windowHeight = window.innerHeight
    this.FriendlistService.resizeWindow(window.innerWidth)
    this.MapService.getFakeCenter()
  }

  ngOnDestroy() {
    this.openChatWidgetsSub.unsubscribe()
    this.sessionStateSub.unsubscribe()
  }
}
