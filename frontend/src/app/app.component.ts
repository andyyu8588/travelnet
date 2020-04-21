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
  user = sessionStorage.getItem('username')
  openChatWidgets: string[]
  private openChatWidgets_sub: any

  constructor(private friendlistService: FriendlistService){
    if(this.user){
      this.openChatWidgets_sub = this.friendlistService.openWidgets.subscribe(x => {this.openChatWidgets = x; console.log(this.openChatWidgets)})
    }
  }

  onNavigate(feature: any) {
    this.currentFeature = feature;
  }
}
