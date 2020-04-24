import { SessionService } from './../../services/session.service';
import { SocketService } from 'src/app/services/socket.service';
import { Component, OnInit, Renderer2, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
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
  // private socketRoom: string
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
    //pull Chatroom content from backend
    this.socketService.emit('initChatroom', ({id: this.roomId, username: this.username}))
    this.socketService.once('initChatroom_res').subscribe((data: any) => {
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
    
    //listen for messages & add display them
    this.socketService.listen('message_res').subscribe((data: any) => {
      if(this.roomId == data.res.roomId){
        const ul: HTMLParagraphElement = this.renderer.createElement('ul');
        ul.innerHTML = `${data.res.sender === this.username ? "you" : data.res.sender}: ${data.res.content}`
        this.renderer.appendChild(this.div.nativeElement, ul)
        this.typeArea = ``
      } else {
      } 
    })
  }
  
  //send message with socket
  sendMessage(data: string) {
    console.log(this.roomId)
    this.socketService.emit('message', {roomId: this.roomId, sender: this.username, content: data})    
  }

  ngOnDestroy(){
    this.socketService.remove('message_res')
    this.socketService.remove('createChatroom_res')
  }
}
