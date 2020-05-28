import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { search } from './search/search.model';
import { tab } from '../../../tab.model'
import { SearchService } from 'src/app/services/search.service';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
@Component({
  selector: 'app-searchresults',
  templateUrl: './searchresults.component.html',
  styleUrls: ['./searchresults.component.scss']
})
export class SearchresultsComponent implements OnInit,OnDestroy {
  constructor(private SearchService : SearchService) {}
  searches
  openTabs: tab[] = []
  private returnTabs: Subscription


  ngOnInit(): void {
  this.returnTabs = this.SearchService.searchTabs.subscribe((tabs)=> this.openTabs = tabs)
  this.openTabs.forEach(e=>{
    if (e.title){
      console.log('ji')
    }})


  this.searches = this.openTabs[0].content
  console.log(this.searches)
  }

  ngOnDestroy(){
    this.returnTabs.unsubscribe()
  }
}
