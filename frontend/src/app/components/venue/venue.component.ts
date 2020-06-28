import { venueModel } from './venue.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FoursquareService } from 'src/app/services/map/foursquare.service';
import { SearchService } from 'src/app/services/search.service';
import { Subscription } from 'rxjs';
import { tab } from '../tabs/tab.model';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.scss']
})
export class VenueComponent implements OnInit,OnDestroy {
  url :string = null
  content: any = null
  displayContent: Array<{[key: string]: any}> = []

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
      for(let key in this.content) {
        let obj: {[key: string]: any} = {}
        obj[key] = this.content[key]
        this.displayContent.push(obj)
      }
    })




  }
  goBack(){
    console.log(this.content)
    // this.SearchService.goBack()
    // this.router.navigate([this.openTab.path])
  }

  ngOnDestroy() {
    this.openTabSub.unsubscribe()
  }

}
