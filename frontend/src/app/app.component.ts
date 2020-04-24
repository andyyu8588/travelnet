import { SessionService } from './services/session.service';
import { RoomWidget } from './components/friendlist/friend/Room_Widget.model';
import { Component, DoCheck } from '@angular/core';
import { FriendlistService } from './services/friendlist.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements DoCheck {

  currentFeature:string
  title = 'frontend';
  sessionState: boolean
  user = sessionStorage.getItem('username')
  openChatWidgets: any

  constructor(
    private FriendlistService: FriendlistService,
    private SessionService: SessionService){
      
    let openChatWidgets_sub = this.FriendlistService.openWidgets.subscribe(x => this.openChatWidgets = x)
    this.SessionService.session()
    let y = this.SessionService.sessionState.subscribe(x => this.sessionState = x)
    let x = this.SessionService.currentFeature.subscribe(x => this.currentFeature = x)
  }

  onNavigate(feature: any) {
    this.currentFeature = feature;
  }

  ngDoCheck() {
    // console.log(this.sessionState)
  }

}
