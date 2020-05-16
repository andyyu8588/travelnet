import { Subscription } from 'rxjs';
import { SessionService } from '../../../services/session.service';
import { SocketService } from 'src/app/services/socket.service';
import { Component, OnInit, Renderer2, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';
import { RoomWidget } from '../friendlist/friend/Room_Widget.model'

@Component({
  selector: 'app-chatwidget',
  templateUrl: './chatwidget.component.html',
  styleUrls: ['./chatwidget.component.scss']
})

export class ChatwidgetComponent implements OnInit, OnDestroy {
  @Input() roomName: string
  @Input() roomId: string
  @ViewChild('textarea') div: ElementRef
  sessionRoomName: string
  typeArea: string = ''
  sessionState: boolean
  private sessionSub: Subscription
  roomModel: RoomWidget
  private roomSub: Subscription
  username: string = sessionStorage.getItem('username')
 

  constructor(private friendlistService: FriendlistService,
              private renderer: Renderer2,
              private socketService: SocketService,
              public sessionService: SessionService) {

  }

  ngOnInit(): void {
    // subscribe to Observables
    this.sessionSub = this.sessionService.sessionState.subscribe((isLoggedIn) => {
      this.sessionState = isLoggedIn
    })

    this.roomSub = this.friendlistService.roomModel.subscribe((room) => {
      this.roomModel = room
    })

    this.sessionRoomName = this.sessionService.getRoomName(this.roomName)

    // pull Chatroom content from backend
    this.socketService.emit('initChatroom', {id: this.roomId, username: this.username}, (data) => {
      if (data.err) {
        console.log(data.err)
      } else {
        data.messages.forEach((message) => {
          const ul: HTMLParagraphElement = this.renderer.createElement('ul');
          ul.innerHTML = `${message.sender === this.username ? "you" : message.sender}: ${message.content}`
          this.renderer.appendChild(this.div.nativeElement, ul)
        })
      }
    })

    this.friendlistService.selectChatwidget(this.roomId)

    
    // listen for messages & add display them
    this.socketService.listen('message_res').subscribe((data: any) => {
      if(this.roomId == data.res.roomId){
        const ul: HTMLParagraphElement = this.renderer.createElement('ul');
        ul.innerHTML = `${data.res.sender === this.username ? "you" : data.res.sender}: ${data.res.content}`
        this.renderer.appendChild(this.div.nativeElement, ul)
        this.typeArea = ``
      } else {
      } 
    })

    // listen for notifications
    this.socketService.listen('notification').subscribe((data: any) => {
      
    })
  }
  
  // send message with socket
  sendMessage(data: string): void {
    if (data != '') {
      this.socketService.emit('message', {roomId: this.roomId, sender: this.username, content: data})    
    }
  }

  toggleChatWidget(): void {
    this.friendlistService.getRoomWidget(this.roomId)
    this.friendlistService.toggleChatWidget(this.roomModel)
    this.ngOnDestroy()
  }
  
  ngOnDestroy(): void {
    this.socketService.remove('message_res')
    this.roomSub.unsubscribe()
    this.sessionSub.unsubscribe()
  }
}