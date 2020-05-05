import { Subscription } from 'rxjs';
import { SessionService } from './../../services/session.service';
import { RoomWidget } from './friend/Room_Widget.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})

export class FriendlistComponent implements OnInit, OnDestroy {
  sessionState: boolean 
  friends: RoomWidget[] = []
  private friendsSub: Subscription
  private sessionSub: Subscription
  
  constructor(private friendlistService: FriendlistService,
    private SessionService: SessionService) { }

  ngOnInit(): void {
    // setup sessionState and friends observable
    this.sessionSub = this.SessionService.sessionState.subscribe((isLoggedIn) => {
      this.sessionState = isLoggedIn

      if (isLoggedIn) {
        this.friendsSub = this.friendlistService.chatroomList.subscribe((friends) => this.friends = friends)
        this.friendlistService.getList([])
      } else {
        console.log(`not logged in`)
      }
    })
  }

  ngOnDestroy(): void {
    this.friendsSub.unsubscribe()
    this.sessionSub.unsubscribe()
  }

  // update friendlist on each key press
  onKey(data: string) {
    if (data === "") {
      this.friendlistService.getList([sessionStorage.getItem("username")])
    } else {
      let arr: string[] = data.split(' ')
      this.friendlistService.getList(arr)
    }
  }

  // creates new room on submit
  onSubmit(data: string) {
    this.friendlistService.CreateChatroom(data)
  }
}