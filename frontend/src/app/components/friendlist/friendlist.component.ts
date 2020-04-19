import { friend } from './friend/friend.model';
import { SocketService } from 'src/app/services/socket.service';
import { Component, OnInit} from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {
  friends= []
  onKey(any){
    this.friendlist.initList(any)
    this.friends = this.friendlist.list
  }
  
  constructor(private socketService: SocketService, private friendlist: FriendlistService) {
  }

  ngOnInit(): void {
    
  }

}