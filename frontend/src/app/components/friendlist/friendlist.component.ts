import { SessionService } from './../../services/session.service';
import { RoomWidget } from './friend/Room_Widget.model';
import { Component, OnInit} from '@angular/core';
import { FriendlistService } from 'src/app/services/friendlist.service';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {
  session: boolean = this.SessionService.session()
  friends: RoomWidget[] = []

  onKey(data: string){
    let arr: string[] = data.split(' ')
    this.friendlist.getList(arr)
    this.friends = this.friendlist.chatroomlist
  }
  
  constructor(
    private friendlist: FriendlistService,
    private SessionService: SessionService) {
  }

  ngOnInit(): void {
    this.friendlist.getList([sessionStorage.getItem('username')])
    this.friends = this.friendlist.chatroomlist
  }

}