import { MatListOption } from '@angular/material/list'
import { AddToTripPopoverComponent } from './../add-to-trip-popover/add-to-trip-popover.component'
import { CustomCoordinates } from 'src/app/models/coordinates'
import { MapService } from 'src/app/services/map/map.service'
import { tripModel } from './../../../../models/trip.model'
import { Subscription } from 'rxjs'
import { TripService } from './../../../../services/trip.service'
import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core'
import { SearchService } from 'src/app/services/search.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-venueButton',
  templateUrl: './venueButton.component.html',
  styleUrls: ['./venueButton.component.scss']
})
export class VenueButtonComponent implements OnInit, OnDestroy {
  pathID: string
  searchResult: any
  @Input() select: any
  @Input() result: any
  @ViewChild(AddToTripPopoverComponent) AddToTripPopoverComponent: AddToTripPopoverComponent

  // keeps track of user trips
  trips_sub: Subscription
  trips: tripModel[] = null

  isLoading = false
  isSuccess = false
  isErr = false

  constructor(
    private SearchService: SearchService,
    private TripService: TripService,
    private router: Router,
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
  }

  navigate(){
    this.router.navigate([this.pathID])
  }

  /** add venue to specific trips */
  addToTrip(event: MatListOption[]) {
    this.isLoading = true
    this.SearchService.formatDetails(this.result.venue.id)
    .then(result => {
      console.log(result)
      if (event.length && this.trips) {
        event.map((option: MatListOption) => {
          this.trips[option.value.trip].schedule[option.value.day].venues.push({
            name: result.response.venue.name ? result.response.venue.name : null,
            venueAddress: result.response.venue.location.formattedAddress ? result.response.venue.location.formattedAddress.join(' ') : null,
            venueCoord: result.response.venue.location.lng ? {lng: result.response.venue.location.lng, lat: result.response.venue.location.lat} : null,
            venueCity: result.response.venue.location.city ? result.response.venue.location.city : null,
            url: result.response.venue.canonicalUrl ? result.response.venue.canonicalUrl : null,
            category: result.response.venue.categories[0] ? { name: result.response.venue.categories[0].name, url: result.response.venue.categories[0].icon.prefix + '32' + result.response.venue.categories[0].icon.suffix } : null
          })
        })

        this.TripService.modifyBackend(this.trips)
        .then((val) => {
          this.isSuccess = true
        })
        .catch(err => {
          this.isErr = true
        })
      }
    })
    .catch(() => {
      this.isErr = true
      setTimeout(() => {
        this.isErr = false
      }, 800)
    })
    .finally(() => {
      this.isLoading = false
    })
  }

  /** show venue location on map */
  showLocation() {
    this.MapService.venueOnDestroy()
    this.MapService.addMarker(new CustomCoordinates(this.result.venue.location.lng, this.result.venue.location.lat))
  }

  ngOnDestroy() {
    this.MapService.venueOnDestroy()
    this.trips_sub.unsubscribe()
    this.MapService.venueOnDestroy()
  }
}
