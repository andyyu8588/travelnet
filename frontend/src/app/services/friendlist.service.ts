import { RoomWidget } from './../components/friendlist/friend/Room_Widget.model';
import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FriendlistService {

  // lists of variables (eg: chatrooms, open chatWidgets)
  private roomarr: RoomWidget[] = [] //all chatrooms of user
  private widgetarr: any = [] //open chatWidgets roomName(s)
  private idarr: any = [] //open chatWidget roomId(s)
   

  // creating observable
  private _chatroomList: BehaviorSubject<RoomWidget[]> = new BehaviorSubject(this.roomarr)
  public chatroomList: Observable<RoomWidget[]> = this._chatroomList.asObservable()

  private _openWidgets: BehaviorSubject<object> = new BehaviorSubject([])
  public openWidgets: Observable<object> = this._openWidgets.asObservable()

  private _windowsSize: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth)
  public windowSize: Observable<number> = this._windowsSize.asObservable()
  
  private _roomModel: BehaviorSubject<RoomWidget> = new BehaviorSubject(new RoomWidget("asd", "asd", false))
  public roomModel: Observable<RoomWidget> = this._roomModel.asObservable()

  constructor(private SocketService: SocketService) {

  }

  // gets list of chatrooms with corresponding properties than user's query
  getList(array: string[]): any{
    array.push(sessionStorage.getItem('username'))
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    // sends array of users in alphabeltical order 
    this.SocketService.emit('searchChatroom', {sender: sessionStorage.getItem('username'), req: polishedarr}, (data) => {
      this.roomarr = []
      this._chatroomList.next(this.roomarr)
      if(data.err){
        console.log(data.err)
      }
      else if (data.res) {
        (data.res).forEach(element => {

          let unread: boolean
          if (element.messages.length) { // check if chat is empty and if last message is unread
            let lastIndex = element.messages.length - 1
            if (element.messages[lastIndex].seen.includes(sessionStorage.getItem('username'))) {
              unread = false
            } else {
              unread = true
            }
          } else {
            unread = false
          }
           
          this.roomarr.push({
            roomName: element.roomName,
            roomId: element._id,
            unread: unread
          })
        });
        this._chatroomList.next(this.roomarr)
      }
    })
  }

  // looks for room model given a roomid
  getRoomWidget(roomId: string) {
    this.roomarr.forEach((room) => {
      if (room.roomId == roomId) {
        this._roomModel.next(room)
      }
    })
  } 

  // looks for users existence and creates chatroom
  CreateChatroom(users: string): any {
    let array: string[] = users.split(' ')
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    this.SocketService.emit('searchUser', polishedarr, (data) => {
      if (data.err) {
        console.log(data.err)
      } else if (data.res) {
        polishedarr.push(sessionStorage.getItem('username')) 
        this.SocketService.emit('createChatroom', polishedarr.sort())
      } 
      polishedarr = []
    })
  }

  // selecting a Chatroom from Friendlist component
  toggleChatWidget(friend: RoomWidget) {
    if (this.idarr.includes(friend.roomId)) {
      let i = this.idarr.indexOf(friend.roomId)
      this.widgetarr.splice(i, 1)
      this.idarr.splice(i, 1)
      friend.open = false
    } else {
      this.widgetarr.push(friend.roomName)
      this.idarr.push(friend.roomId)
      friend.open = true
    }
    this._openWidgets.next({
      roomNames: this.widgetarr,
      roomIds: this.idarr
    })
  }

  // listen for unread messages from backend
  getNotifications() {
    this.SocketService.listen('notification').subscribe((data: any) => {
      if (data.res) {
        let i = this.roomarr.findIndex((e) => e.roomId === data.res.roomId)
        if (data.res.action == 'message') {
          if (i != -1) {
            console.log('i defined ' + i)
            if (data.res.sender == sessionStorage.getItem('username')) {
              this.roomarr[i].unread = false
            } else {
              this.roomarr[i].unread = true
            }
            this._chatroomList.next(this.roomarr)
          } else {
            console.log('i undefined')
          } 
        } else if (data.res.action == 'seen') {
          data.res.seen.forEach(element => {
            if(element.includes(sessionStorage.getItem('username'))) {
              this.roomarr[i].unread = false
              this._chatroomList.next(this.roomarr)
            }
          });
        }
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

  resizeWindow(width: number) {
    const CHATWIDGETWIDTH: number = 220
    const FRIENDLISTWIDTH: number = 220
    const MAXNUM: number = Math.floor((width - FRIENDLISTWIDTH) / CHATWIDGETWIDTH) // take into account friendlist component
    if (this.widgetarr.length > MAXNUM) {
      for (let x = this.widgetarr.length; x > MAXNUM; x--) {
        let removedRoomId = this.idarr[0]
        this.roomarr.forEach((room) => {
          if (room.roomId == removedRoomId) {
            room.open = false
          }
        })
        this.widgetarr.shift()
        this.idarr.shift()
      }
    }    
    this._windowsSize.next(width)
  }
}