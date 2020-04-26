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

  constructor(private SocketService: SocketService) {

  }

  //gets list of chatrooms with corresponding properties than user's query
  getList(array: string[]): any{
    array.push(sessionStorage.getItem('username'))
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    //sends array of users in alphabeltical order 
    this.SocketService.emit('searchChatroom', {sender: sessionStorage.getItem('username'), req: polishedarr}, (data) => {
      console.log('ack received')
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
        console.log('getList fini')
      }
    })
  }

  // looks for users existence and creates chatroom
  CreateChatroom(users: string): any{
    let array: string[] = users.split(' ')
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.SocketService.emit('searchUser', polishedarr)
    this.SocketService.once('searchUser_res').subscribe((data: any) => {
      console.log(data)
      if(data.err){

      } else if (data.res) {
        console.log(polishedarr)
        polishedarr.push(sessionStorage.getItem('username')) 
        console.log(polishedarr)
        this.SocketService.emit('createChatroom', polishedarr.sort())
      } else {
        console.log('somethin went wrong')
      }
      polishedarr = []
    })
  }

  toggleChatWidget(friend: RoomWidget) {
    if(this.idarr.includes(friend.roomId)){
      let i = this.idarr.indexOf(friend.roomId)
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

  getNotifications() {
    console.log('listening for notif')
    this.SocketService.listen('notification').subscribe((data) => {
      console.log(data)
    })
  }
}

