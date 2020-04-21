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
  private widgetarr: Array<string> = []

  //creating observable
  _chatroomList: BehaviorSubject<RoomWidget[]> = new BehaviorSubject(this.roomarr)
  public chatroomList: Observable<RoomWidget[]> = this._chatroomList.asObservable()

  _openWidgets: BehaviorSubject<string[]> = new BehaviorSubject(this.widgetarr)
  public openWidgets: Observable<string[]> = this._openWidgets.asObservable()

  constructor(private socketService: SocketService) {

  }

  //gets list of chatrooms with corresponding properties than user's query
  getList(array: string[]): any{
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.socketService.once("searchChatroom_res").subscribe((data:any) => {
      this.roomarr = []
      this._chatroomList.next(this.roomarr)
      if(data.res){
        (data.res).forEach(element => {
          this.roomarr.push({
            roomName: element.roomName,
          })
        });
        this._chatroomList.next(this.roomarr)
      } else {
      }
    })
    //sends array of users in alphabeltical order 
    this.socketService.emit('searchChatroom', {sender: sessionStorage.getItem('username'), req: polishedarr})
  }

  openRoom(users: string){
    let array: string[] = users.split(' ')
    // array.push(sessionStorage.getItem('username'))
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.socketService.once('createChatroom_res').subscribe((data:any) => {
      let polished = (this.roomarr.filter((a,b) => this.roomarr.indexOf(a) === (b))).sort()
      this.roomarr = polished
    })
    this.socketService.emit('createChatroom', polishedarr)
  }

  toggleChatWidget(roomName: string): any{
    if(this.widgetarr.includes(roomName)){
      console.log('here')
      let i = this.widgetarr.indexOf(roomName)
      this.widgetarr.splice(i, 1)
    } else {
      console.log('not here')
      this.widgetarr.push(roomName)
    }
    this._openWidgets.next(this.widgetarr)
  }

}

