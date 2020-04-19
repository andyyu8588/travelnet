import { Component, OnInit, Output, Type, Input } from '@angular/core';
import { friend } from './friend.model';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.scss']
})
export class FriendComponent implements OnInit {

  @Input() friend:friend

  constructor() { }

  ngOnInit(): void {
  }

}
