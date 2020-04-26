import { SessionService } from './../../services/session.service';
import { RoomWidget } from './friend/Room_Widget.model';
import { Component, OnInit} from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {
  sessionState: boolean 
  friends: RoomWidget[] = []
  private friends_sub: any
  
  constructor(
    private friendlistService: FriendlistService,
    private SessionService: SessionService,
    ) {

    //setup sessionState observable
    let x = this.SessionService.sessionState.subscribe(x => {
      this.sessionState = x
      if(x === true){
        this.friends_sub = this.friendlistService.chatroomList.subscribe(x => this.friends = x)
        this.friendlistService.getList([])
      } else {
        console.log(`not logged in`)
      }
    })
  } 

  ngOnInit(): void {
    
  }

  //update friendlist on each key press
  onKey(data: string) {
    let arr: string[] = data.split(' ')
    this.friendlistService.getList(arr)
  }

  //creates new room on submit
  onSubmit(data: string) {
    this.friendlistService.CreateChatroom(data)
  }
}