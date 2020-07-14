import { CustomCoordinates } from './../../../../models/coordinates';
import { environment } from './../../../../../environments/environment.dev';
import { Router } from '@angular/router';
import { MapService } from './../../../../services/map/map.service';
import { CategoryNode } from './../../../../models/CategoryNode.model';
import { SearchService } from './../../../../services/search.service';
import { tripModel } from './../../../../models/trip.model';
import { TripService } from './../../../../services/trip.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CitySearchComponent } from './../../../city-search/city-search.component';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { stringify } from '@angular/compiler/src/util';

@Component({
  selector: 'app-add-venue-popover',
  templateUrl: './add-venue-popover.component.html',
  styleUrls: ['./add-venue-popover.component.scss']
})
export class AddVenuePopoverComponent implements OnInit, AfterViewInit, OnDestroy {
  // user data from tripService
  allTrips: tripModel[] = []
  private trips_sub: Subscription

  // passed by mytrip
  tripIndex: number
  dayIndex: number

  // foursquare venues categories
  defaultCategory: string = 'All'
  venueCategories: CategoryNode[] = []

  // for database venue search
  searchVenueForm: FormGroup
  mapCenter_sub: Subscription
  searchUrlCoord: CustomCoordinates

  // for custom add venue
  @ViewChild('citySearch') CitySearchComponent: CitySearchComponent
  private selectedOption_sub: Subscription
  citySearchAppearance: string = 'outline'
  citySearchPlaceholder: string = 'Search for a City'
  customVenueForm: FormGroup
  
  // for component visual
  isLoading: boolean = false
  isLoaded: boolean
  isErr: boolean = false

  constructor(private SearchService: SearchService,
              private TripService: TripService,
              private MapService: MapService,
              private Router: Router,
              public dialogRef: MatDialogRef<AddVenuePopoverComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                tripIndex: number,
                scheduleIndex: number
                venueName: string
                venuePrice: number
                venueCity: string
                venueAddress: string
              }) {
    this.tripIndex = data.tripIndex
    this.dayIndex = data.scheduleIndex
  }

  ngOnInit(): void {
    this.isLoaded = false

    // sets mat select venue category options 
    this.SearchService.updateCategories()
    .then((response: {tree: CategoryNode[], set: any}) => {
      response.tree.forEach((element: CategoryNode) => {
        this.venueCategories.push(element)
      })
    })

    // gets user trips from trip service
    this.trips_sub = this.TripService.trips.subscribe((trips: tripModel[]) => {
      this.allTrips = trips
    })

    // get map center from map service
    this.mapCenter_sub = this.MapService.fakeCenter.subscribe((coord: CustomCoordinates) => {
      this.searchUrlCoord = coord
    })

    this.searchVenueForm = new FormGroup({
      'name': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(25)])
    })

    this.customVenueForm = new FormGroup({
      'name': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(25)]),
      'address': new FormControl(null),
      'price': new FormControl(null)
    })
  }

  ngAfterViewInit() {
    // selected option from autosuggest
    this.selectedOption_sub = this.CitySearchComponent.clickedOption.subscribe((location) => {
      if (location.name) {
        this.CitySearchComponent.value = location.name
      }
    })
  }

  onSubmitSearch() {
    this.isLoading = true
    if (this.searchVenueForm.valid) {
      let name: string = this.searchVenueForm.get('name').value
      let coord: string = this.searchUrlCoord? this.searchUrlCoord.toStringReorder(2) : '45.5035,73.5685'
      this.isLoading = false
      this.dialogRef.close()
      this.Router.navigateByUrl('/search/' + name + '&' + coord)
    }
    this.isLoading = false
  }

  // update when user adds custom venue 
  onSubmitCustom() {
    if (this.customVenueForm.valid) {
      this.allTrips[this.tripIndex].schedule[this.dayIndex].venues.push({
        venueName: this.customVenueForm.get('name').value,
        venueCity: this.CitySearchComponent.value? this.CitySearchComponent.value : '',
        venueAddress: this.customVenueForm.get('address').value? this.customVenueForm.get('address').value : '',
        price: this.customVenueForm.get('price').value? this.customVenueForm.get('price').value : 0
      })
      this.TripService.modifyBackend(this.allTrips)
      .then((response) => {
        this.TripService.updateLocal(this.allTrips)
        setTimeout(() => {
          this.dialogRef.close()
        }, 500)
      })
      .catch((err) => {
        this.isErr = true
      })
      .finally(() => {
        this.isLoading = false
        this.isLoaded = true
      })
    }
  }

  ngOnDestroy() {
    this.selectedOption_sub.unsubscribe()
    this.trips_sub.unsubscribe()
    this.mapCenter_sub.unsubscribe()
  }
}
