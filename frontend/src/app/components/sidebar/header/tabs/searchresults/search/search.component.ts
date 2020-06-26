import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { search } from './search.model'
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  searchResult : any
  @Input() result: any
  constructor (private searchservice: SearchService) {
  }



  ngOnInit(): void {
    this.searchResult = this.result
  }

}
