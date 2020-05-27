import { environment } from './../../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { MapService } from 'src/app/services/map/map.service';
import { overwrite, getCode } from 'country-list';
import { OpenstreetmapService } from './../../../services/map/openstreetmap.service';
import { Observable, Subscription, BehaviorSubject, concat } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Component, OnInit, Output, Input, OnDestroy } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import * as CountriesList from 'countries-list'
import * as CountriesConverter from 'i18n-iso-countries'

export interface VisitedPlaces {
  code: string;
  continent: string;
  places: string[];
}

@Component({
  selector: 'app-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss']
})
export class CountrySelectorComponent implements OnInit, OnDestroy {
  @Input() direction: boolean
  timeout: any
  value = ''
  allPlaces: VisitedPlaces[] = [
    {code:'NA', continent: 'North-America', places: []},
    {code:'SA', continent: 'South-America', places: []},
    {code:'EU', continent: 'Europe', places: []},
    {code:'AS', continent: 'Asia', places: []},
    {code:'AF', continent: 'Africa', places: []},
    {code:'OC', continent: 'Oceania', places: []},
    {code:'AN', continent: 'Antarctica', places: []}
  ];
  _autoSuggest: BehaviorSubject<Array<{[key: string]: any}>> = new BehaviorSubject([])
  autoSuggestCountries: Observable<Array<{[key: string]: any}>> = this._autoSuggest.asObservable()
  isLoading: boolean = false

  myControl: FormControl = new FormControl()
  removable: boolean = true
  searched: Subscription
  
  clickLocation: Subscription

  constructor(private OpenstreetmapService: OpenstreetmapService,
              private MapService: MapService,
              private Http: HttpClient) { 
  }
  
  ngOnInit() {
    this.searched = this.myControl.valueChanges.subscribe(x => {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.isLoading = true
        this._autoSuggest.next([{}])
        this.OpenstreetmapService.citySearch(x.toString()).subscribe(response => {
          this.isLoading = false
          let searchResults: Array<{[key: string]: any}> = []
          response.features.forEach(element => {
            let name = this.removeMiddle(element.properties.display_name, 2)
            searchResults.push({name: name, content: element})
          });
          // searchResults.sort((a, b) => {
          //   if (a.content.properties.importance - b.content.properties.importance > 0) {
          //     return -1
          //   }
          //   else if (a.content.properties.importance - b.content.properties.importance < 0) {
          //     return 1
          //   }
          //   else {
          //     return 0
          //   }
          // })
          this._autoSuggest.next(searchResults)
        }, (err) => {
          this.isLoading = false
          console.log(err)
        })
      }, 400)
    })
    this.clickLocation = this.MapService.clickLocation.subscribe(x => {
      if (x.lng && x.lat) {
        this.Http.get<any>(
          environment.mapbox.geocoding.concat('/', x.lng, ',', x.lat, '.json'),
          {
            headers: {},
            params: {
              access_token: environment.mapbox.token,
              types: 'country,region,district,place',
              language: environment.language
            }
          }
        )
        .subscribe((response) => {
          if (response.features[0]) {
            let placeName = response.features[0].place_name
            let chip = this.removeMiddle(placeName, 1)
            this.getKey(response.features[response.features.length -1].properties.short_code.toUpperCase())
              .then((value: any) => {
                let continent = value.continent
                this.allPlaces.forEach((element) => {
                  if (element.code === continent && !element.places.includes(chip)) {
                    element.places.push(chip)
                    this.MapService.showMarker({
                      name: chip,
                      content:{
                        geometry:{
                          coordinates: response.query
                        }
                      }
                    })
                  }
                })
                
              })
              .catch((err) => {
                console.log(err)
              })
          }
        }, (err) => {
          console.log(err)
        })
      }
    })
  }

  // filters city name string
  removeMiddle(string: string, keep: number): string {
    let arr: string[] = string.split(',')
    let nothing = arr[0]
    for (let x = 1; x < keep; x++) {
      nothing = nothing.concat(', ', arr[x])
    }
    return nothing.concat(', ', arr[arr.length - 1])
  }

  // displays chip and clear search input
  onSelected(event: MatAutocompleteSelectedEvent) {
    let chip = this.removeMiddle(event.option.value, 1)
    let countryName = ((event.option.value.split(', '))[event.option.value.split(', ').length - 1]).substring(1)
    let code = getCode(countryName)
    this.getKey(code)
      .then((value: any) => {
        let continent = value.continent
        this.allPlaces.forEach((element) => {
          if (element.code === continent && !element.places.includes(chip)) {
            element.places.push(chip)
          }
        })
      })
      .catch((err) => {
        console.log(err)
      })
    this.value = ''
  }

  passData(content: any) {
    content.name = this.removeMiddle(content.name, 1)    
    console.log(content)
    this.MapService.showMarker(content)
  }

  // search Countrieslist countries 
  getKey(code: string) {
    return new Promise((resolve, reject) => {
      let value = Object.keys(CountriesList.countries).find(key => {
        if(key === code) {
          resolve(CountriesList.countries[key])
        }
      })
      if(!value) {
        reject('not found')
      }
    })
  }

  // remove chips
  onRemove(place: string, index: number) {
    let placesArr = this.allPlaces[index].places
    placesArr.splice(placesArr.indexOf(place), 1)
    this.MapService.removeMarker(place)
  }

  ngOnDestroy() {
    this.searched.unsubscribe()
    this.clickLocation.unsubscribe()
  }
}