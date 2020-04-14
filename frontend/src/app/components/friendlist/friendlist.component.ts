import { SocketService } from './../../services/socket.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {
  
  results = []
  friends = []
  
  constructor(private SocketService: SocketService) {
  }

  ngOnInit(): void {
  }

  findFriend_sub (event){
    this.friends = []
    this.SocketService.emit('searchChatroom', event)
    this.SocketService.once("searchChatroom_res").subscribe((data:any) => {
      console.log('bhay'+ data.res.Users)
      this.friends.push(data.res.Users)
    })
  }
}
