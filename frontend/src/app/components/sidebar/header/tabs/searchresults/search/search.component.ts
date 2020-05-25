import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { search } from './search.model'
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  searchResult : string
  @Input() search: search
  constructor (private searchservice: SearchService) {
  }



  ngOnInit(): void {
    console.log(this.search)
    this.searchResult = this.searchservice.getSearchResult(this.search)

  }

}
