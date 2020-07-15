import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomCoordinates } from './../../models/coordinates';
import { CitySearchComponent } from './../city-search/city-search.component';
import { CategoryNode } from './../../models/CategoryNode.model';
import { Component, OnInit, Renderer2, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MapService } from 'src/app/services/map/map.service';
import { Router } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { tab } from 'src/app/models/tab.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  loading: boolean = false

  categories: CategoryNode[]
  openTab: tab
  fakeCenter: CustomCoordinates = null
  private returnTab_sub: Subscription
  private fakeCenter_sub: Subscription
  @ViewChild('searchResultsContainer') div: ElementRef

  // forms
  searchBarForm: FormGroup

  // filters
  @ViewChild(CitySearchComponent) CitySearchComponent: CitySearchComponent
  defaultFilter: any = '0'

  constructor(
    private MapService: MapService,
    private router : Router,
    private SearchService: SearchService,
  ) { }

  ngOnInit(): void {
    this.searchBarForm = new FormGroup({
      'venueName': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(25)])
    })

    this.returnTab_sub = this.SearchService.searchTab.subscribe((tab) => {
      this.openTab = tab
    })

    this.fakeCenter_sub = this.MapService.fakeCenter.subscribe((coord: CustomCoordinates) => {
      this.fakeCenter = coord? coord : new CustomCoordinates(73.5673, 45.5017)
      console.log(this.fakeCenter)
    })

    this.SearchService.updateCategories().then((x: {set: any, tree: any}) => {
      this.categories = x.tree
    })
  }

  onSubmit() {
    if (this.searchBarForm.valid) {
      this.SearchService.enterSearch(this.searchBarForm.get('venueName').value, this.SearchService.mainSearch(this.searchBarForm.get('venueName').value, this.fakeCenter), this.fakeCenter)
      .then(() => {
        this.router.navigate(['search'], {queryParams: {query: this.openTab.query, lng: this.fakeCenter.lng, lat: this.fakeCenter.lat}})
      })
      .catch(err => {
        console.log(err)
      })      
    }
  }

  changeFilter(filter:{response:string, value:string}) {
    this.SearchService.changeFilter(parseInt(filter.value))
  }

  ngOnDestroy() {
    this.returnTab_sub.unsubscribe()
    this.fakeCenter_sub.unsubscribe()
  }
}
