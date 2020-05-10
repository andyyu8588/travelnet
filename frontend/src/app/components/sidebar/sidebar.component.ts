import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  items: Array<any> = ['Home', 'Discover','My Trip']
  width: number = 30
  constructor() { }

  ngOnInit(): void {
  }

}
