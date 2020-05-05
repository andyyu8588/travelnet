import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';
import { SessionService } from './services/session.service';
import { RoomWidget } from './components/friendlist/friend/Room_Widget.model';
import { Component, DoCheck, OnInit, OnDestroy } from '@angular/core';
import { FriendlistService } from './services/friendlist.service';

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
  openChatWidgets_sub: Subscription
  sessionState: boolean
  sessionState_sub: Subscription

  constructor(
    private FriendlistService: FriendlistService,
    private SessionService: SessionService,
    private SocketService: SocketService){

    // check if logged in from other tab (if LocalStorage exist)
    localStorage.getItem('username')?
    this.SocketService.emit('updateLogin', {username: localStorage.getItem('username')}, (data) => {
      if(data.res){
        sessionStorage.setItem('username', data.res)
        SessionService.session()
      } else if (data.err){
        console.log(data.err)
      }
    })
    : {}

    // calling observables
    this.openChatWidgets_sub = this.FriendlistService.openWidgets.subscribe(x => this.openChatWidgets = x)
    this.sessionState_sub = this.SessionService.sessionState.subscribe(x => {
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
  }

  ngOnDestroy() {
    this.openChatWidgets_sub.unsubscribe()
    this.sessionState_sub.unsubscribe()
  }
}
