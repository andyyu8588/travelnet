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

  constructor(private SearchService: SearchService) { }

  ngOnInit(): void {
  }

  deleteTab(tab){
    this.SearchService.deleteTab(tab.index)
  }

}
