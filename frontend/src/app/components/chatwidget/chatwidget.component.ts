import { SessionService } from './../../services/session.service';
import { SocketService } from 'src/app/services/socket.service';
import { Component, OnInit, Type, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-chatwidget',
  templateUrl: './chatwidget.component.html',
  styleUrls: ['./chatwidget.component.scss']
})
export class ChatwidgetComponent implements OnInit{
  readonly: boolean = false
  typeonly: boolean = true
  session: boolean = this.sessionService.session()
  @ViewChild('textarea') div: ElementRef

  constructor(
    private frienlistService: FriendlistService,
    private renderer: Renderer2,
    private socketService: SocketService,
    public sessionService: SessionService ){ 
  
    this.socketService.listen('message_res').subscribe((data: any) => {
      const ul: HTMLParagraphElement = this.renderer.createElement('ul');
      ul.innerHTML = data.res.content
      this.renderer.appendChild(this.div.nativeElement, ul)
    })
  
  }

  ngOnInit(): void {
  }

  createRoom(data: string){
    console.log('createroom called')
    this.frienlistService.openRoom(data)
    this.socketService.once('createChatroom_res').subscribe((data: any) => {
      if(data.res){
        this.readonly = true
        this.typeonly = false
        data.forEach((element) => {
          const ul: HTMLParagraphElement = this.renderer.createElement('ul');
          ul.innerHTML = element.content
          this.renderer.appendChild(this.div.nativeElement, ul)
        })
      } else {
        console.log('error _res')
      }
    })
  }

  sendMessage(data: string){
    this.socketService.emit('message', {sender: sessionStorage.getItem('username'), content: data})
  }
}
