import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';
import { friend } from '../components/friendlist/friend/friend.model';

@Injectable({
  providedIn: 'root'
})
export class FriendlistService {

  public list: Array<friend> = []

  constructor(private socketService: SocketService) { }

  initList(polishedArray){
    this.list=[]
    this.socketService.once("searchChatroom_res").subscribe((data:any) => {
      (data.res).forEach(element => {
        this.list.push({
          username: element.Users,

        })
      });
    })
    this.socketService.emit('searchChatroom', polishedArray)
  }
}
