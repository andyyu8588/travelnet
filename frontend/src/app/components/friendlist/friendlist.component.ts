import { friend } from './friend/friend.model';
import { SocketService } from 'src/app/services/socket.service';
import { Component, OnInit} from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {
  

  friends = []
  
  constructor(private socketService: SocketService, public friendlist: FriendlistService) {
  }

  ngOnInit(): void {
    
  }

  findFriend_sub (event){
    let userArr: string[] = event.split(' ')
    let polishedArray: string[] = userArr.filter((a,b) => userArr.indexOf(a) === (b))
    this.socketService.emit('searchChatroom', polishedArray)
    this.socketService.listen("searchChatroom_res").subscribe((data:any) => {
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