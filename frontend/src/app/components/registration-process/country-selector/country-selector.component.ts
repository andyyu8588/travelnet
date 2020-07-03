import { HttpService } from './../../../services/http.service';
import { CitySearchComponent } from './../../city-search/city-search.component';
import { clickLocationCoordinates } from './../../../services/map/map.service';
import { environment } from './../../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { MapService } from 'src/app/services/map/map.service';
import { getCode } from 'country-list';
import { Subscription } from 'rxjs';
import { Component, OnInit, Input, OnDestroy, AfterContentInit, ViewChild, AfterViewInit } from '@angular/core';
import * as CountriesList from 'countries-list'

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
export class CountrySelectorComponent implements OnInit, AfterContentInit, AfterViewInit ,OnDestroy {
  @ViewChild('citySearch') citySearchComponent: CitySearchComponent
  citySearchAppearance: string = 'standard'
  citySearchPlaceholder: string = 'Search for Locations'
  optionClick_sub: Subscription
  @Input() progressUpdate: any
  @Input() target: number
  allPlaces: VisitedPlaces[] = [
    {code:'NA', continent: 'North-America', places: []},
    {code:'SA', continent: 'South-America', places: []},
    {code:'EU', continent: 'Europe', places: []},
    {code:'AS', continent: 'Asia', places: []},
    {code:'AF', continent: 'Africa', places: []},
    {code:'OC', continent: 'Oceania', places: []},
    {code:'AN', continent: 'Antarctica', places: []}
  ];
  removable: boolean = true

  private clickLocation_sub: Subscription

  constructor(private MapService: MapService,
              private Http: HttpClient,
              private HttpService: HttpService) { 
  }
  
  ngOnInit() {
  }

  ngAfterContentInit() {
    // display city where user clicked
    this.clickLocation_sub = this.MapService.clickLocation.subscribe((x: clickLocationCoordinates) => {
      if (this.progressUpdate && this.target == this.progressUpdate) {
        if (x.lng != null) {
          this.Http.get<any>(
            environment.mapbox.geocoding.concat('/', x.lng.toString(), ',', x.lat.toString(), '.json'),
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
                      this.MapService.showMarker(this.target, {
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
      }
    })
  }

  ngAfterViewInit() {
    this.optionClick_sub = this.citySearchComponent.clickedOption.subscribe(content => {
      if (content.name) {
        // displays chip and clear search input
        let chip = this.removeMiddle(content.name, 1)
        let countryName = ((content.name.split(', '))[content.name.split(', ').length - 1]).substring(1)
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
        
        // show location on map
        content.name = this.removeMiddle(content.name, 1)    
        this.MapService.showMarker(this.target, content)
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
    this.MapService.removeMarker(place, this.target)
  }

  onClear() {
    this.allPlaces.forEach(element => {
      element.places = []
    })
    this.MapService.removeMarker('', null, true)
  }

  // send data to backend
  onSumbit(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.HttpService.patch('/user/edit', {
        username: localStorage.getItem('username').toString(),
        proprety: (this.target == 1)? 'history':'wishlist',
        newProprety: this.allPlaces
      })
      .then((response) => {
        resolve(response)
      })
      .catch(err => {
        reject(err)
      })
    })

  }

  ngOnDestroy() {
    this.clickLocation_sub.unsubscribe()
    this.optionClick_sub.unsubscribe()
  }
}