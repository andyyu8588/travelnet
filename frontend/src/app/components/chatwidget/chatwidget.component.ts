import { Component, OnInit} from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-chatwidget',
  templateUrl: './chatwidget.component.html',
  styleUrls: ['./chatwidget.component.scss']
})
export class ChatwidgetComponent implements OnInit{

  constructor(private frienlistService: FriendlistService) { 
  }

  ngOnInit(): void {
  }

  createRoom(data: string){
    this.frienlistService.openRoom(data)
  }
}
