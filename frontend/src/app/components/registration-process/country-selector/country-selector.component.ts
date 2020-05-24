import { OpenstreetmapService } from './../../../services/map/openstreetmap.service';
import { Observable, Subscription, BehaviorSubject, concat } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Component, OnInit, Output, Input, OnDestroy } from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { rejects } from 'assert';

export interface VisitedPlaces {
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
    {continent: 'America', places: ['Paris','London']},
    {continent: 'Europe', places: []},
    {continent: 'Asia', places: []},
    {continent: 'Africa', places: []},
    {continent: 'Oceania', places: []},
    {continent: 'Antarctica', places: []}
  ];
  _autoSuggest: BehaviorSubject<any> = new BehaviorSubject('')
  autoSuggestCountries: Observable<string[]> = this._autoSuggest.asObservable()

  myControl: FormControl = new FormControl()
  removable: boolean = true
  searched: Subscription
  
  constructor(private OpenstreetmapService: OpenstreetmapService) { }
  
  ngOnInit() {
    this.searched = this.myControl.valueChanges.subscribe(x => {
      this.OpenstreetmapService.citySearch(x.toString()).subscribe(response => {
        console.log(response)
        let searchResults: any[] = []
        response.features.forEach(element => {
          let name = this.removeMiddle(element.properties.display_name, 2)
          searchResults.push(name)
        });
        this._autoSuggest.next(searchResults)
      }, (err) => {
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
    this.allPlaces[1].places.push(chip)
    this.value = ''
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