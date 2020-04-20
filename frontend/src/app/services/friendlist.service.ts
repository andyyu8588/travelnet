import { RoomWidget } from './../components/friendlist/friend/Room_Widget.model';
import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendlistService {

  //holds list of chatrooms
  private roomarr: RoomWidget[] = []

  //creating observable
  _chatroomlist: BehaviorSubject<RoomWidget[]> = new BehaviorSubject(this.roomarr)
  public chatroomlist: Observable<RoomWidget[]> = this._chatroomlist.asObservable()

  constructor(private socketService: SocketService) {

  }

  //gets list of chatrooms with corresponding properties than user's query
  getList(array: string[]): any{
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.socketService.once("searchChatroom_res").subscribe((data:any) => {
      this.roomarr = []
      this._chatroomlist.next(this.roomarr)
      if(data.res){
        (data.res).forEach(element => {
          this.roomarr.push({
            roomName: element.roomName,
          })
        });
        this._chatroomlist.next(this.roomarr)
      } else {
      }
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

