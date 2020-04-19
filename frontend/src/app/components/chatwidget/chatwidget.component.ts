import { Component, OnInit, Type, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-chatwidget',
  templateUrl: './chatwidget.component.html',
  styleUrls: ['./chatwidget.component.scss']
})
export class ChatwidgetComponent implements OnInit{
  readonly: boolean = false
  @ViewChild('textarea') div: ElementRef
  
  constructor(private frienlistService: FriendlistService, private renderer: Renderer2) { 
  }

  ngOnInit(): void {
  }

  createRoom(data: string){
    this.readonly = true
    this.frienlistService.openRoom(data)
  }

  sendMessage(data: string){
    const ul: HTMLParagraphElement = this.renderer.createElement('ul');
    ul.innerHTML = data
    this.renderer.appendChild(this.div.nativeElement, ul)
  }
}
