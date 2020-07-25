import { SearchParams } from './../../models/searchParams';
import { ActivatedRoute } from '@angular/router';
import { geocodeResponseModel } from './../../models/geocodeResp.model';
import { MapService } from './../../services/map/map.service';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { OpenstreetmapService } from './../../services/map/openstreetmap.service';
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, OnDestroy, Output, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-city-search',
  templateUrl: './city-search.component.html',
  styleUrls: ['./city-search.component.scss']
})
export class CitySearchComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSelect) MatSelect: MatSelect
  @Input() appearance: string
  @Input() placeholder: string
  //initial location
  @Input() location: string
  @Input() getFakeCenterCity: boolean
  @Input() clearOnSearch: boolean
  //for custom event emiting
  @Output() locationAdded = new EventEmitter<string>();

  // search input variables
  myControl: FormControl = new FormControl(null)
  timeout
  searched: Subscription

  isLoading: boolean = false

  openstreetmap_sub: Subscription

  private fakeCenterCity_sub: Subscription

  // display suggestions on autosuggest
  private _autoSuggested: BehaviorSubject<Array<{[key: string]: any}>> = new BehaviorSubject([])
  autoSuggested: Observable<Array<{[key: string]: any}>> = this._autoSuggested.asObservable()

  //return clicked option
  _clickedOptionLocal: geocodeResponseModel = null
  private _clickedOption: BehaviorSubject<geocodeResponseModel> = new BehaviorSubject(this._clickedOptionLocal)
  clickedOption: Observable<geocodeResponseModel> = this._clickedOption.asObservable()

  constructor(private OpenstreetmapService: OpenstreetmapService,
              private MapService: MapService,
              private ActivatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.MapService.citySearchPresent = true

    this.ActivatedRoute.queryParams.subscribe((params: SearchParams) => {
      if (params.lng) {
        this.OpenstreetmapService.reverseSearch(params.lng, params.lat)
        .subscribe((res) => {
          if (res.features[0]) {
            this.myControl.patchValue(this.removeMiddle(res.features[0].properties.display_name, 1))
            this._clickedOptionLocal = new geocodeResponseModel(this.myControl.value, res.features[0].geometry.coordinates)
            this._clickedOption.next(this._clickedOptionLocal)
          }
        })
      }
    })

    // search for new cities on input value change
    this.searched = this.myControl.valueChanges.subscribe(x => {
      this._clickedOptionLocal = null
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.isLoading = true
        this._autoSuggested.next([{}])
        this.openstreetmap_sub = this.OpenstreetmapService.citySearch(x.toString()).subscribe(response => {
          this.isLoading = false
          let searchResults: Array<{[key: string]: any}> = []
          response.features.forEach(element => {
            let name = this.removeMiddle(element.properties.display_name, 2)
            searchResults.push({name: name, content: element})
          });
          this._autoSuggested.next(searchResults)
        }, (err) => {
          this.isLoading = false
          console.log(err)
        })
      }, 400)
    })

    if (this.getFakeCenterCity) {
      // sub to city name at fake center
      this.fakeCenterCity_sub = this.MapService.fakeCenterCity.subscribe((res: {[key: string]: any, features: Array<{[key: string]: any}>}) => {
        if (res.features) {
          this.placeholder = 'Region'
          this.myControl.patchValue(this.removeMiddle(res.features[0].properties.display_name, 1))
          this._clickedOptionLocal = new geocodeResponseModel(this.myControl.value, res.features[0].geometry.coordinates)
          this._clickedOption.next(this._clickedOptionLocal)
        } else {
          this.myControl.patchValue('')
          this.placeholder = 'No city found'
        }
      })
    }
  }

  ngAfterViewInit() {
  }

  /** check if input contains valid city */
  checkCityValidity(): boolean {
    if (!this._clickedOptionLocal || this.myControl.value == '') {
      return true
    } else {
      return false
    }
  }

  /** filters city name string */
  removeMiddle(string: string, keep: number): string {
    let arr: string[] = string.split(',')
    let nothing = arr[0]
    for (let x = 1; x < keep; x++) {
      nothing = nothing.concat(', ', arr[x])
    }
    return nothing.concat(', ', arr[arr.length - 1])
  }

  /** when option is clicked */
  onOptionClick(country: {[key: string]: any}) {
    this._clickedOptionLocal = new geocodeResponseModel(country.name, country.content.geometry.coordinates, country.content)
    console.log(this._clickedOptionLocal + '???')
    this._clickedOption.next(this._clickedOptionLocal)
    this.clearOnSearch? this.myControl.patchValue('') : null
    // this.emitCountry(this._clickedOptionLocal.name)
  }

  emitCountry(city) {
    console.log(city)
    this.locationAdded.emit(city)
    this.clearOnSearch? this.myControl.patchValue('') : null
  }

  ngOnDestroy() {
    this.MapService.citySearchPresent = false
    this.searched.unsubscribe()
    this.fakeCenterCity_sub? this.fakeCenterCity_sub.unsubscribe() : null
    this.openstreetmap_sub? this.openstreetmap_sub.unsubscribe() : null
  }

}
