import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FoursquareService } from 'src/app/services/map/foursquare.service';
import { SearchService } from 'src/app/services/search.service';
import { Subscription } from 'rxjs';
import { tab } from '../sidebar/tab.model';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.scss']
})
export class VenueComponent implements OnInit,OnDestroy {
  url :string = null
  content : any = null
  private openTabSub: Subscription
  openTab:tab
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private SearchService: SearchService
  ) { }

  ngOnInit(): void {
    this.openTabSub = this.SearchService.searchTab.subscribe(x => {
      this.openTab = x
    })

    this.url = this.router.url.replace('/search/venue/','')
    this.SearchService.formatDetails(this.url).then(result=>{
      this.content = result.response.venue
    })

  }
  goBack(){
    this.SearchService.goBack()
    this.router.navigate([this.openTab.path])
  }

  ngOnDestroy() {
    this.openTabSub.unsubscribe()
  }

}
