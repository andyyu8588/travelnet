import { Component, OnInit, Input } from '@angular/core';
import { tab } from '../../../../tab.model'
@Component({
  selector: 'app-searchbutton',
  templateUrl: './searchbutton.component.html',
  styleUrls: ['./searchbutton.component.scss']
})
export class SearchbuttonComponent implements OnInit {
  @Input() searchTab: tab
  // @Input() index: number

  constructor() { }

  ngOnInit(): void {
  }

  deleteTab(i){
    console.log(i)
  }

}
