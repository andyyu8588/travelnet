import { Component, OnInit, Input } from '@angular/core';
import { tab } from '../../../../tab.model'
import { SearchService } from './../../../../../../services/search.service'
@Component({
  selector: 'app-searchbutton',
  templateUrl: './searchbutton.component.html',
  styleUrls: ['./searchbutton.component.scss']
})
export class SearchbuttonComponent implements OnInit {
  @Input() searchTab: tab
  @Input() i : number

  constructor(private SearchService: SearchService) { }

  ngOnInit(): void {
  }

  deleteTab(Tab){
    this.SearchService.deleteTab(Tab)
  }

}
