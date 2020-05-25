import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { search } from './search/search.model';
import { SearchService } from 'src/app/services/search.service';
@Component({
  selector: 'app-searchresults',
  templateUrl: './searchresults.component.html',
  styleUrls: ['./searchresults.component.scss']
})
export class SearchresultsComponent implements OnInit,OnDestroy {

  searches: search[] = []
  private returnSearch: Subscription
  constructor(private SearchService : SearchService) {}

  ngOnInit(): void {
  this.returnSearch = this.SearchService.searchResults.subscribe((searches) => this.searches = searches)
  console.log(this.searches)
  }

  ngOnDestroy(){
    this.returnSearch.unsubscribe
  }
}
