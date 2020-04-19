import { RoomWidget } from './../components/friendlist/friend/Room_Widget.model';
import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FriendlistService {

  //holds list of chatrooms
  public chatroomlist: Array<RoomWidget> = []

  constructor(private socketService: SocketService) {

  }

  //gets list of chatrooms with corresponding properties than user's query
  getList(array: string[]){
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.socketService.once("searchChatroom_res").subscribe((data:any) => {
      this.chatroomlist = [];
      (data.res).forEach(element => {
          this.chatroomlist.push({
          roomName: element.roomName,
        })
      });
    })
    //sends array of users in alphabeltical order 
    this.socketService.emit('searchChatroom', {sender: sessionStorage.getItem('username'), req: polishedarr})
  }

  openRoom(users: string){
    let array: string[] = users.split(' ')
    array.push(sessionStorage.getItem('username'))
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.socketService.once('createChatroom_res').subscribe((data:any) => {

    })
    this.socketService.emit('createChatroom', polishedarr)
  }
}

