import { SessionService } from './../../services/session.service';
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
  session: boolean = this.SessionService.session()
  friends: friend[] = []

  onKey(any){
    this.friendlist.initList(any)
    this.friends = this.friendlist.list
  }
  
  constructor(
    private socketService: SocketService,
    private friendlist: FriendlistService,
    private SessionService: SessionService) {
  }

  ngOnInit(): void {
    
  }

}