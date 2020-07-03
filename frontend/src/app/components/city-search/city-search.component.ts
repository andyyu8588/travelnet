import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { OpenstreetmapService } from './../../services/map/openstreetmap.service';
import { FormControl } from '@angular/forms';
import { Component, OnInit, Input, OnDestroy, Output } from '@angular/core';

@Component({
  selector: 'app-city-search',
  templateUrl: './city-search.component.html',
  styleUrls: ['./city-search.component.scss']
})
export class CitySearchComponent implements OnInit, OnDestroy {
  @Input() appearance: string
  @Input() placheholder: string

  
  // search input variables
  myControl: FormControl = new FormControl()
  value: string = ''
  timeout
  searched: Subscription

  isLoading: boolean = false
  
  openstreetmap_sub: Subscription

  // display suggestions on autosuggest
  private _autoSuggested: BehaviorSubject<Array<{[key: string]: any}>> = new BehaviorSubject([])
  autoSuggested: Observable<Array<{[key: string]: any}>> = this._autoSuggested.asObservable()

  //return clicked option
  private _clickedOption: BehaviorSubject<{[key: string]: any}> = new BehaviorSubject({})
  clickedOption: Observable<{[key: string]: any}> = this._clickedOption.asObservable()

  constructor(private OpenstreetmapService: OpenstreetmapService) { }

  ngOnInit(): void {
    // search for new cities on input value change
    this.searched = this.myControl.valueChanges.subscribe(x => {
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

  // when option is clicked
  onOptionClick(country: {[key: string]: any}) {
    this._clickedOption.next(country)
    // this.value = ''
  }

  ngOnDestroy() {
    this.searched.unsubscribe()
    this.openstreetmap_sub.unsubscribe()
  } 

}
