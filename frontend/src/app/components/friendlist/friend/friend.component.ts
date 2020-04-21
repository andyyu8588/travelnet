import { Component, OnInit, Input } from '@angular/core';
import { RoomWidget } from './Room_Widget.model';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.scss']
})
export class FriendComponent implements OnInit {

  @Input() friend: RoomWidget

  constructor(private friendlistService: FriendlistService) {

  }

  ngOnInit(): void {

  }

  //open or close chat widget 
  toggleChatWidget(friend: any) {
    let room: string = friend.roomName 
    this.friendlistService.toggleChatWidget(room)
  }

}
