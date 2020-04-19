import { Component, OnInit, Output, Type, Input } from '@angular/core';
import { RoomWidget } from './Room_Widget.model';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.scss']
})
export class FriendComponent implements OnInit {

  @Input() friend:RoomWidget

  constructor() { }

  ngOnInit(): void {
  }

}
