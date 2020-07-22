import { environment } from './../../../environments/environment.dev';
import { OpenstreetmapService } from './../../services/map/openstreetmap.service';
import { SearchParams } from './../../models/searchParams';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomCoordinates } from './../../models/coordinates';
import { CitySearchComponent } from './../city-search/city-search.component';
import { CategoryNode } from './../../models/CategoryNode.model';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { MapService } from 'src/app/services/map/map.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { tab } from 'src/app/models/tab.model';
import { Subscription } from 'rxjs';
import { geocodeResponseModel } from 'src/app/models/geocodeResp.model';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() submission = new EventEmitter<void>()
  @Input() isChild: boolean = false
  loading: boolean = false

  foursquareCategory_sub: Subscription
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
  clickedOption: geocodeResponseModel = null
  filterOptions: {
    0: string,
    1: string,
    2: string
  } = {
    0: '...',
    1: 'Venues',
    2: 'Users'
  }
  defaultFilter: string = '0'
  defaultCategory: string = 'All'

  constructor(
    private MapService: MapService,
    private router : Router,
    private SearchService: SearchService,
    private ActivatedRoute: ActivatedRoute,
    private OpenstreetmapService: OpenstreetmapService
  ) { }

  ngOnInit(): void {
    this.searchBarForm = new FormGroup({
      'venueName': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(25)])
    })


    this.returnTab_sub = this.SearchService.searchTab.subscribe((tab) => {
      this.openTab = tab
    })

    this.fakeCenter_sub = this.MapService.fakeCenter.subscribe((coord: CustomCoordinates) => {
      this.fakeCenter = coord? coord : environment.montrealCoord
    })

    this.foursquareCategory_sub = this.SearchService.categoryTree.subscribe((cats: CategoryNode[]) => {
      this.categories = cats
    })
  }

  ngAfterViewInit() {
    // for coordinates of city search
    this.clickedOption_sub = this.CitySearchComponent.clickedOption.subscribe((city: geocodeResponseModel) => {
      if (city) {
        this.clickedOption = city
      } else {
        this.clickedOption = null
      }
    })
    
    this.ActivatedRoute.queryParams.subscribe((params: SearchParams) => {
      // set param to montreal if no location param 
      if (!params.lng) {
        // this.CitySearchComponent.myControl.patchValue('Montreal, Canada')
        this.CitySearchComponent._clickedOptionLocal = new geocodeResponseModel(this.CitySearchComponent.myControl.value, [this.fakeCenter.lng, this.fakeCenter.lat]) 
      } else {
        this.OpenstreetmapService.reverseSearch(params.lng, params.lat).subscribe((response: {[key: string]: any}) => {
          if (response.features[0]) {
            this.CitySearchComponent.myControl.patchValue(response.features[0].properties.address.city + ',' + response.features[0].properties.address.country)
          }
        })
      }
      if (params.query) {
        this.searchBarForm.get('venueName').setValue(params.query)
        
        // if url contains query 
        if (!this.SearchService.hasSearch) {
          this.loading = true
          let coord: CustomCoordinates = params.lng? new CustomCoordinates(params.lng, params.lat) : this.MapService.getCenter() 
          this.SearchService.enterSearch(params.query, this.SearchService.mainSearch(params.query, coord), coord)
          .finally(()=>{
            this.loading = false
          })      
        }
      }
    })
  }

  onSubmit() {
    if (this.searchBarForm.valid && this.CitySearchComponent.myControl.valid) {
      this.submission.emit()
      let coord: CustomCoordinates = this.clickedOption? new CustomCoordinates(this.clickedOption.content.geometry.coordinates[0], this.clickedOption.content.geometry.coordinates[1]) : this.fakeCenter
      this.SearchService.enterSearch(this.searchBarForm.get('venueName').value, this.SearchService.mainSearch(this.searchBarForm.get('venueName').value, coord), coord)
      .then(() => {
        this.router.navigate(['search'], {queryParams: {query: this.searchBarForm.get('venueName').value, lng: coord.lng, lat: coord.lat, category: this.defaultCategory}})
      })
      .catch(err => {
        console.log(err)
      })      
    }
  }

  /** all|venues|users */
  changeFilter(filter:{response:string, value:string}) {
    this.defaultFilter = filter.value
    this.defaultCategory = this.filterOptions[filter.value]
    this.SearchService.changeFilter(parseInt(filter.value))
  }

  ngOnDestroy() {
    this.returnTab_sub.unsubscribe()
    this.fakeCenter_sub.unsubscribe()
    this.clickedOption_sub.unsubscribe()
  }
}
