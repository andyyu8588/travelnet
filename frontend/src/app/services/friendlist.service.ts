import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';
import { friend } from '../components/friendlist/friend/friend.model';

@Injectable({
  providedIn: 'root'
})
export class FriendlistService {

  private list: Array<friend>

  constructor(private socketService: SocketService) { }

  initList(polishedArray){
    this.socketService.once("searchChatroom_res").subscribe((data:any) => {
      (data.res).forEach(element => {
        this.list.push({
          username: element.Username,
        })
      });
    })
    this.socketService.emit('searchChatroom', polishedArray)
  }
}
