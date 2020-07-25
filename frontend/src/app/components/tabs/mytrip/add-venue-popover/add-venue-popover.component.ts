import { SearchBarComponent } from './../../../search-bar/search-bar.component';
import { CustomCoordinates } from './../../../../models/coordinates';
import { MapService } from './../../../../services/map/map.service';
import { CategoryNode, foursquareCategory } from './../../../../models/CategoryNode.model';
import { SearchService } from './../../../../services/search.service';
import { tripModel } from './../../../../models/trip.model';
import { TripService } from './../../../../services/trip.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CitySearchComponent } from './../../../city-search/city-search.component';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Inject } from '@angular/core';

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
  venueIndex: number|null

  // foursquare venues categories
  foursquareCategory_sub: Subscription
  defaultCategory: string = 'All'
  venueCategories: foursquareCategory[] = []

  // for database venue search
  @ViewChild(SearchBarComponent) SearchBarComponent: SearchBarComponent
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
              public dialogRef: MatDialogRef<AddVenuePopoverComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                tripIndex: number
                scheduleIndex: number
                venueIndex: number|null
                venueName: string
                venuePrice: number
                venueCity: string
                venueAddress: string
              }) {
    this.tripIndex = data.tripIndex
    this.dayIndex = data.scheduleIndex
    this.venueIndex = data.venueIndex
  }

  ngOnInit(): void {
    this.isLoaded = false

    // sets mat select venue category options 
    this.foursquareCategory_sub =  this.SearchService.categoryTree.subscribe((cats: foursquareCategory[]) => {
      this.venueCategories = cats
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

    // fill form if user is editing venue
    if (this.venueIndex != null) {
      this.customVenueForm.get('name').patchValue(this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].name? this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].name : '')
      this.customVenueForm.get('address').patchValue(this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].venueAddress? this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].venueAddress : '')
      this.customVenueForm.get('price').patchValue(this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].price? this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].price : 0)
    }
  }

  ngAfterViewInit() {
    // selected option from autosuggest
    this.selectedOption_sub = this.CitySearchComponent.clickedOption.subscribe((location) => {
      if (location) {
        this.CitySearchComponent.myControl.patchValue(location.name)
      }
    })

    // fill form if user is editing venue
    if (this.venueIndex != null) {
      this.CitySearchComponent.myControl.patchValue(this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].venueCity? this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex].venueCity : '')
    }
  }

  /** when user searches venues from foursquare */
  onSubmitSearch() {
    this.isLoading = true
    if (this.SearchBarComponent.searchBarForm.valid) {
      this.isLoading = false
      this.dialogRef.close()
    }
    this.isLoading = false
  }

  /** update when user adds custom venue */
  onSubmitCustom() {
    if (this.customVenueForm.valid) {
      let url: any = null
      for(let category of this.venueCategories) {
        if (category.name === this.defaultCategory) {
          url = category.icon.prefix + '32' + category.icon.suffix
          break
        }
      }        

      // if edit venue
      if (this.venueIndex != null) {
        this.allTrips[this.tripIndex].schedule[this.dayIndex].venues[this.venueIndex] = {
          name: this.customVenueForm.get('name').value,
          venueCity: this.CitySearchComponent.myControl.value ? this.CitySearchComponent.myControl.value : '',
          venueAddress: this.customVenueForm.get('address').value? this.customVenueForm.get('address').value : '',
          price: this.customVenueForm.get('price').value? this.customVenueForm.get('price').value : 0,
          category: url? {name: this.defaultCategory, url: url} : null
        }
      } else {
        // if add venue
        this.allTrips[this.tripIndex].schedule[this.dayIndex].venues.push({
          name: this.customVenueForm.get('name').value,
          venueCity: this.CitySearchComponent.myControl.value ? this.CitySearchComponent.myControl.value : '',
          venueAddress: this.customVenueForm.get('address').value? this.customVenueForm.get('address').value : '',
          price: this.customVenueForm.get('price').value? this.customVenueForm.get('price').value : 0,
          category: url? {name: this.defaultCategory, url: url} : null
        })
      }
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
    this.foursquareCategory_sub.unsubscribe()
    this.mapCenter_sub.unsubscribe()
  }
}
