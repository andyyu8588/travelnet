import { tripModel } from './../../models/trip.model';
import { TripService } from './../../services/trip.service';
import { MatListOption } from '@angular/material/list';
import { environment } from './../../../environments/environment.dev';
import { MapService } from 'src/app/services/map/map.service';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
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
  ogUrl: string = null
  url:string = null
  content: selectedVenueModel = null
  rating: number = null
  ratingColor: any = null
  displayContent: Array<{[key: string]: any}> = []
  windowHeight: number = window.innerHeight

  isLoading: boolean = false
  isSuccess: boolean = false
  isErr: boolean = false

  private trip_sub: Subscription
  trips: tripModel[] = []

  private openTabSub: Subscription
  openTab: tab
  constructor(
    private router: Router,
    private SearchService: SearchService,
    private MapService: MapService,
    private TripService: TripService
  ) { }

  ngOnInit(): void {
    this.trip_sub = this.TripService.trips.subscribe((trips: tripModel[]) => {
      this.trips = trips
    })

    this.openTabSub = this.SearchService.searchTab.subscribe(x => {
      this.openTab = x
    })
    this.ogUrl = environment.travelnetURL + this.router.url
    this.url = this.router.url.replace('/search/venue/','')
    this.SearchService.formatDetails(this.url).then(result=>{
      console.log(result)
      this.content = result.response.venue
      if (this.content.rating && this.content.ratingColor) {
        this.rating = this.content.rating
        this.ratingColor = `#${this.content.ratingColor}`
      }
    })
  }
    /** add venue to specific trips */
    addToTrip(event: MatListOption[]) {
      this.isLoading = true
      if (event.length && this.trips) {
        event.map((option: MatListOption) => {
          this.trips[option.value.trip].schedule[option.value.day].venues.push({
            name: this.content.name? this.content.name : null,
            venueAddress: this.content.location.formattedAddress? this.content.location.formattedAddress.join(' ') : null,
            venueCoord: this.content.location.lng? {lng: this.content.location.lng, lat: this.content.location.lat} : null,
            venueCity: this.content.location.city? this.content.location.city : null,
            url: this.content.canonicalUrl? this.content.canonicalUrl : null,
            category: this.content.categories[0]? { name: this.content.categories[0].name, url: this.content.categories[0].icon.prefix + '32' + this.content.categories[0].icon.suffix } : null
          })
        })

        this.TripService.modifyBackend(this.trips)
        .then((val) => {
          this.isSuccess = true
        })
        .catch(err => {
          this.isErr = true
        })
        .finally(() => {
          setTimeout(() => {
            this.isErr = false
          }, 800)
          this.isLoading = false
        })
      }
    }

  goBack(){
    this.router.navigate(['search'], {queryParams: this.SearchService.currentSearch? this.SearchService.currentSearch : {}})
  }

  // check if is object
  isObject(val: any): boolean {
    if (typeof(val) == 'object') {
      return true
    } else {
      return false
    }
  }

  // for ngIf, filter keys in user reviews
  reviewKeys(key: string): boolean {
    let keys = ["likes", "text", "user"]
    if (keys.includes(key)) {
      return true
    } else  {
      return false
    }
  }

  showOnMap(location: {[key: string]: any}) {
    this.MapService.addMarker(location)
  }

  ngOnDestroy() {
    this.openTabSub.unsubscribe()
    this.MapService.venueOnDestroy()
  }

}
