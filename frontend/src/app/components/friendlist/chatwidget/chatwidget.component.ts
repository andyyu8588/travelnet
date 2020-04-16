import { friend } from './../friend.model';
import { Component, OnInit, Input, Output, DoCheck } from '@angular/core';

@Component({
  selector: 'app-chatwidget',
  templateUrl: './chatwidget.component.html',
  styleUrls: ['./chatwidget.component.scss']
})
export class ChatwidgetComponent implements OnInit, DoCheck{

  @Input() friends 
  
  constructor() { 
  }

  ngOnInit(): void {
  }

  ngDoCheck(){
    console.log(this.friends)
  }

}
