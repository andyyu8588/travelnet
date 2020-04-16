import { friend } from './../../../components/friendlist/friend.model';
import { SocketService } from './../socket.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FriendlistService {

  private list: Array<object> = []

  constructor(private socketService: SocketService) { }

  initList(polishedArray){
    this.socketService.emit('searchChatroom', polishedArray)
    this.socketService.listen("searchChatroom_res").subscribe((data:any) => {
      (data.res).forEach(element => {
        this.list.push({
          
        })
      });
    })
  }

}
