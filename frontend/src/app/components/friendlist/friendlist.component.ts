import { friend } from './friend.model';
import { SocketService } from './../../services/socket.service';
import { Component, OnInit } from '@angular/core';
import { strict } from 'assert';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {
  
  results = []
  friends = []
  friendvisibility: boolean
  
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
      (data.res).forEach(element => {
        this.friends.push(element) 
      });
    })
  }

  private bool: boolean = false
  
  openFriend(e){
   
    return this.bool
    
  }

}
