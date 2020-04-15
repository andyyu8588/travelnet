import { friend } from './friend.model';
import { SocketService } from './../../services/socket.service';
import { Component, OnInit } from '@angular/core';
import { strict } from 'assert';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {
  
  results = []
  friends = []
  friendvisibility: boolean
  
  constructor(private SocketService: SocketService) {
  }

  ngOnInit(): void {
    
  }

  findFriend_sub (event){
    let userArr: string[] = event.split(' ')
    let polishedArray: string[] = userArr.filter((a,b) => userArr.indexOf(a) === (b))
    this.SocketService.emit('searchChatroom', polishedArray)
    this.SocketService.listen("searchChatroom_res").subscribe((data:any) => {
      this.friends = [];
      (data.res).forEach(element => {
        this.friends.push(element)
      });
    })
  }

  public num: number = -1

  openFriend(e: number){
    if(this.num === e){
      this.num = -1
    } else {
      this.num = e
    }
  }
}