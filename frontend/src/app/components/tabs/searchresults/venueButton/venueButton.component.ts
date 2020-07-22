import { CustomCoordinates } from 'src/app/models/coordinates';
import { MapService } from 'src/app/services/map/map.service';
import { tripModel } from './../../../../models/trip.model';
import { Subscription } from 'rxjs';
import { TripService } from './../../../../services/trip.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-venueButton',
  templateUrl: './venueButton.component.html',
  styleUrls: ['./venueButton.component.scss']
})
export class VenueButtonComponent implements OnInit, OnDestroy {
  pathID: string
  searchResult : any
  @Input() select: any
  @Input() result: any
  
  // keeps track of user trips
  trips_sub: Subscription
  trips: tripModel[] = null 
  
  // keeps track of index of add venue
  tripIndexes_sub: Subscription
  tripIndexes: {tripIndex: number|null, dayIndex: number|null} = null

  /** determine tooltip text of add to trip */
  addTripText(): string {
    if (Number.isInteger(this.tripIndexes.tripIndex) && this.trips.length) {
      return `add venue to day ${this.tripIndexes.dayIndex+1} of ${this.trips[this.tripIndexes.tripIndex].tripName}`
    } else {
      return `add to trip..`
    }
  }

  isLoading: boolean = false
  isSuccess: boolean = false
  isErr: boolean = false

  constructor (
    private searchservice: SearchService,
    private TripService: TripService,
    private router : Router,
    private MapService: MapService
  ) {
  }

  ngOnInit(): void {
    this.searchResult = this.result
    this.pathID = '/search/venue/' + this.result.venue.id

    this.trips_sub = this.TripService.trips.subscribe((triparr: tripModel[]) => {
      if (triparr) {
        this.trips = triparr
      }
    })

    this.tripIndexes_sub = this.TripService.tripIndexes.subscribe((obj: {tripIndex: number|null, dayIndex: number|null}) => {
      this.tripIndexes = obj
    })
  }

  navigate(){
    this.router.navigate([this.pathID])
  }

  /** add venue to specific trip w/ indexes*/
  addToTrip() {
    this.isLoading = true
    if (this.trips && Number.isInteger(this.tripIndexes.tripIndex)) {
      this.trips[this.tripIndexes.tripIndex].schedule[this.tripIndexes.dayIndex].venues.push(this.result.venue)
      console.log(this.trips)
      this.TripService.modifyBackend(this.trips)
      .then((val) => {
        this.isSuccess = true
      })
      .catch(err => {
        this.isErr = true
      })
      .finally(() => {
        this.isLoading = false
      })
    } else {
      this.isErr = true
      this.isLoading = false
      setTimeout(() => {
        this.isErr = false
      }, 1500)
    }
  }

  /** show venue location on map */
  showLocation() {
    this.MapService.venueOnDestroy()
    this.MapService.addMarker(new CustomCoordinates(this.result.venue.location.lng, this.result.venue.location.lat))
  }

  ngOnDestroy() {
    // this.MapService.venueOnDestroy()
    this.trips_sub.unsubscribe()
    this.tripIndexes_sub.unsubscribe()
    this.MapService.venueOnDestroy()
  }
}
