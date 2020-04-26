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
      this.roomarr = []
      this._chatroomList.next(this.roomarr)
      if(data.err){
        console.log(data.err)
      }
      else if(data.res){
        (data.res).forEach(element => {
          let l = element.messages.length -1
          let i = element.messages[l].seen
          this.roomarr.push({
            roomName: element.roomName,
            roomId: element._id,
            unread: i.includes(sessionStorage.getItem('username'))? false : true
          })
        });
        this._chatroomList.next(this.roomarr)
      }
    })
  }

  // looks for users existence and creates chatroom
  CreateChatroom(users: string): any{
    let array: string[] = users.split(' ')
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.SocketService.emit('searchUser', polishedarr, (data) => {
      if (data.err) {
        console.log(data.err)
      } else if (data.res) {
        console.log(polishedarr)
        polishedarr.push(sessionStorage.getItem('username')) 
        console.log(polishedarr)
        this.SocketService.emit('createChatroom', polishedarr.sort())
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
    this.SocketService.listen('notification').subscribe((data: any) => {
      if (data.res) {
        let i = this.roomarr.findIndex((e) => e.roomId === data.res.roomId)
        this.roomarr[i].unread = true
        this._chatroomList.next(this.roomarr)
      }
    })
  }

  // user interacted with chatwidget
  // mark as read in angular
  selectChatwidget(roomId: string) {
    this.SocketService.emit('initChatroom', {id: roomId, username: sessionStorage.getItem('username') }, (data) => {
      if (data) {
        let i = this.roomarr.findIndex((e) => e.roomId === roomId)
        this.roomarr[i].unread = false
        this._chatroomList.next(this.roomarr)
      }
    })
  }
}

