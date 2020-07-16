import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomCoordinates } from './../../models/coordinates';
import { CitySearchComponent } from './../city-search/city-search.component';
import { CategoryNode } from './../../models/CategoryNode.model';
import { Component, OnInit, Renderer2, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
export class SearchBarComponent implements OnInit, AfterViewInit, OnDestroy {
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
  private clickedOption_sub: Subscription
  clickedOption: {[key: string]: any, name: string, content: {[key: string]: any}} = null
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
    })

    this.SearchService.updateCategories()
    .then((x: CategoryNode[]) => {
      this.categories = x
    })
  }

  ngAfterViewInit() {
    // for coordinates of city search
    this.clickedOption_sub = this.CitySearchComponent.clickedOption.subscribe((city: {[key: string]: any, name: string, content: {[key: string]: any}}) => {
      if (city) {
        this.clickedOption = city
      } else {
        this.clickedOption = null
      }
    })
  }

  onSubmit() {
    if (this.searchBarForm.valid) {
      let coord: CustomCoordinates = this.clickedOption? new CustomCoordinates(this.clickedOption.content.geometry.coordinates[0], this.clickedOption.content.geometry.coordinates[1]) : this.fakeCenter
      this.SearchService.enterSearch(this.searchBarForm.get('venueName').value, this.SearchService.mainSearch(this.searchBarForm.get('venueName').value, coord), this.fakeCenter)
      .then(() => {
        this.router.navigate(['search'], {queryParams: {query: this.openTab.query, lng: coord.lng, lat: coord.lat}})
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
    this.clickedOption_sub.unsubscribe()
  }
}
