import { SessionService } from './../../services/session.service';
import { SocketService } from 'src/app/services/socket.service';
import { Component, OnInit, Type, Renderer2, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-chatwidget',
  templateUrl: './chatwidget.component.html',
  styleUrls: ['./chatwidget.component.scss']
})
export class ChatwidgetComponent implements OnInit, OnDestroy{
  @Input() roomName: string
  @Input() roomId: string
  @ViewChild('textarea') div: ElementRef
  typeArea: string = ''
  private socketRoom: string
  session: boolean = this.sessionService.session()
  username: string = sessionStorage.getItem('username')
 

  constructor(
    private frienlistService: FriendlistService,
    private renderer: Renderer2,
    private socketService: SocketService,
    public sessionService: SessionService,
    ){ 
  }

  ngOnInit(){
    //open or create Chatroom
    this.frienlistService.openRoom(this.roomName)
    this.socketService.once('createChatroom_res').subscribe((data: any) => {
      if(data.res) {
        data.res.forEach((element) => {
          const ul: HTMLParagraphElement = this.renderer.createElement('ul');
          ul.innerHTML = `${element.sender === this.username ? "you" : element.sender}: ${element.content}`
          this.renderer.appendChild(this.div.nativeElement, ul)
        })
      } else {
        console.log('error _res')
      }
    })
    
    let socketRoom_sub = this.frienlistService.socketRoom.subscribe(x => this.socketRoom = x)

    //listen for messages & add display them
    this.socketService.listen('message_res').subscribe((data: any) => {
      const ul: HTMLParagraphElement = this.renderer.createElement('ul');
      ul.innerHTML = `${data.sender === this.username ? "you" : data.sender}: ${data.content}`
      this.renderer.appendChild(this.div.nativeElement, ul)
      this.typeArea = ``
    })

  }
  
  //send message with socket
  sendMessage(data: string) {
    if(this.socketRoom != this.roomId){
      console.log('in same room')
      this.frienlistService.openRoom(this.roomId)
    } else {
      console.log(`not in same room`)
    }
    this.socketService.emit('message', {sender: this.username, content: data})
  }

  ngOnDestroy(){
    this.socketService.remove('message_res')
    this.socketService.remove('createChatroom_res')
  }
}
