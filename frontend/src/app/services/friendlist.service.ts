import { RoomWidget } from './../components/friendlist/friend/Room_Widget.model';
import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendlistService {

  //lists of variables (eg: chatrooms, open chatWidgets)
  private roomarr: RoomWidget[] = []
  private widgetarr: any = []
  private idarr: any = []
   

  //creating observable
  private _chatroomList: BehaviorSubject<RoomWidget[]> = new BehaviorSubject(this.roomarr)
  public chatroomList: Observable<RoomWidget[]> = this._chatroomList.asObservable()

  private _openWidgets: BehaviorSubject<object> = new BehaviorSubject([])
  public openWidgets: Observable<object> = this._openWidgets.asObservable()

  private _socketRoom: BehaviorSubject<string> = new BehaviorSubject('')
  public socketRoom: Observable<string> = this._socketRoom.asObservable()

  constructor(private socketService: SocketService) {

  }

  //gets list of chatrooms with corresponding properties than user's query
  getList(array: string[]): any{
    array.push(sessionStorage.getItem('username'))
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.socketService.once("searchChatroom_res").subscribe((data:any) => {
      this.roomarr = []
      this._chatroomList.next(this.roomarr)
      if(data.res){
        (data.res).forEach(element => {
          this.roomarr.push({
            roomName: element.roomName,
            roomId: element._id
          })
        });
        this._chatroomList.next(this.roomarr)
      } else {
      }
    })
    //sends array of users in alphabeltical order 
    this.socketService.emit('searchChatroom', {sender: sessionStorage.getItem('username'), req: polishedarr})
  }

  openRoom(users: string): any{
    let array: string[] = users.split(' ')
    array.push(sessionStorage.getItem('username'))
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.socketService.once('createChatroom_res').subscribe((data:any) => {
      this._socketRoom.next(data.id._id)
    })
    this.socketService.emit('createChatroom', polishedarr)
  }

  toggleChatWidget(friend: RoomWidget) {
    console.log(friend)
    if(this.widgetarr.includes(friend.roomName)){
      let i = this.widgetarr.indexOf(friend.roomName)
      this.widgetarr.splice(i, 1)
      this.idarr.splice(i, 1)
    } else {
      this.widgetarr.push(friend.roomName)
      this.idarr.push(friend.roomId)
    }
    this._openWidgets.next({
      roomNames: this.widgetarr,
      roomIds: this.idarr
    })
  }

}

