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
  listened: number = 0
  
  constructor(private SocketService: SocketService) {
  }

  ngOnInit(): void {
    
  }

  findFriend_sub (event){
    this.friends = []
    let userArr: string[] = event.split(' ')
    let polishedArray: string[] = userArr.filter((a,b) => userArr.indexOf(a) === (b))
    this.SocketService.emit('searchChatroom', polishedArray)
    this.SocketService.listen("searchChatroom_res").subscribe((data:any) => {
      this.friends.push(data.res.Users)
      this.listened++
      console.log(`listened ${this.listened}`)
    })
  }
}
