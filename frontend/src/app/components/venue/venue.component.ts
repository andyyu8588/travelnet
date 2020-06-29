import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { Subscription } from 'rxjs';
import { tab } from '../../models/tab.model';
import { selectedVenueModel } from '../../models/selectedVenue.model';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.scss']
})
export class VenueComponent implements OnInit,OnDestroy {
  url :string = null
  content: selectedVenueModel = null
  rating: number = null
  ratingColor: any = null
  displayContent: Array<{[key: string]: any}> = []
  windowHeight: number = window.innerHeight

  private openTabSub: Subscription
  openTab:tab
  constructor(
    private router: Router,
    private SearchService: SearchService
  ) { }

  ngOnInit(): void {
    this.openTabSub = this.SearchService.searchTab.subscribe(x => {
      this.openTab = x
    })

    this.url = this.router.url.replace('/search/venue/','')
    this.SearchService.formatDetails(this.url).then(result=>{
      this.content = result.response.venue
      if (this.content.rating && this.content.ratingColor) {
        console.log(this.content.rating, `#${this.content.ratingColor}`)
        this.rating = this.content.rating
        this.ratingColor = `#${this.content.ratingColor}`
      }
    })
  }

  goBack(){
    console.log(this.content)
    this.SearchService.goBack()
    this.router.navigate([this.openTab.path])
  }

  ngOnDestroy() {
    this.openTabSub.unsubscribe()
  }

}
