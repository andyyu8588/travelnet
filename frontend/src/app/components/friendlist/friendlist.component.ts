import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.scss']
})
export class FriendlistComponent implements OnInit {
  friends = [{
    name : 'f',
    status: true,
    thumbnail: 'rhgsr'
  }, {
    name : 'f',
    status: false,
    thumbnail: 'rhgsr'
  }]
  constructor() { }

  ngOnInit(): void {
  }



}
