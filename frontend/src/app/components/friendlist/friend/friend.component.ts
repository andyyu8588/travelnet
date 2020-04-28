import { SessionService } from './../../../services/session.service';
import { Component, OnInit, Input } from '@angular/core';
import { RoomWidget } from './Room_Widget.model';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.scss']
})

export class FriendComponent implements OnInit {

  sessionRoomName : string
  username: string = sessionStorage.getItem('username')

  @Input() friend: RoomWidget
  constructor (private friendlistService: FriendlistService,
    public sessionService: SessionService) {

  }

  ngOnInit(): void {
    this.sessionRoomName = this.sessionService.getRoomName(this.friend.roomName)
  }

  // open or close chat widget 
  toggleChatWidget(friend: RoomWidget) {
    this.friendlistService.toggleChatWidget(friend)
    this.friendlistService.resizeWindow(window.innerWidth)
  }

}
