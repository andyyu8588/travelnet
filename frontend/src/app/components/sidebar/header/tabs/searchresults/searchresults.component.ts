import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { tab } from '../../../tab.model'

@Component({
  selector: 'app-searchresults',
  templateUrl: './searchresults.component.html',
  styleUrls: ['./searchresults.component.scss']
})
export class SearchresultsComponent implements OnInit, OnDestroy {
  openTab: tab
  private returnTab: Subscription
  constructor(
    private SearchService: SearchService
  ) {}



  ngOnInit(): void {
    this.returnTab = this.SearchService.searchTab.subscribe((tab)=> this.openTab = tab)
  }

  ngOnDestroy(){
    this.returnTab.unsubscribe()
  }


}
