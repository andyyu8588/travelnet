import { MapService } from 'src/app/services/map/map.service';
import { element } from 'protractor';
import { getCode } from 'country-list';
import { OpenstreetmapService } from './../../../services/map/openstreetmap.service';
import { Observable, Subscription, BehaviorSubject, concat } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Component, OnInit, Output, Input, OnDestroy } from '@angular/core';
import {ThemePalette} from '@angular/material/core';
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
  
  constructor(private OpenstreetmapService: OpenstreetmapService,
              private MapService: MapService) { }
  
  ngOnInit() {
    this.searched = this.myControl.valueChanges.subscribe(x => {
      this.isLoading = true
      this.OpenstreetmapService.citySearch(x.toString()).subscribe(response => {
        this.isLoading = false
        let searchResults: Array<{[key: string]: any}> = []
        response.features.forEach(element => {
          let name = this.removeMiddle(element.properties.display_name, 2)
          searchResults.push({name: name, content: element})
        });
        this._autoSuggest.next(searchResults)
      }, (err) => {
        this.isLoading = false
        console.log(err)
      })
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
          if (element.code === continent) {
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
    console.log(content.content)
    // this.MapService.highlightCountry('ok')
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
  }

  ngOnDestroy() {
    this.searched.unsubscribe()
  }
}