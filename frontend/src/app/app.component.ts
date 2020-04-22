import { SessionService } from './services/session.service';
import { RoomWidget } from './components/friendlist/friend/Room_Widget.model';
import { Component } from '@angular/core';
import { FriendlistService } from './services/friendlist.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentFeature = 'Registration'
  title = 'frontend';
  session: boolean = this.SessionService.session()
  user = sessionStorage.getItem('username')
  openChatWidgets: any
  private openChatWidgets_sub: any

  constructor(
    private FriendlistService: FriendlistService,
    private SessionService: SessionService){
    if(this.user){
      this.openChatWidgets_sub = this.FriendlistService.openWidgets.subscribe(x => this.openChatWidgets = x)
    }
  }

  onNavigate(feature: any) {
    this.currentFeature = feature;
  }
}
