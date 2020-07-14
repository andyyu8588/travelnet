import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { tab } from 'src/app/models/tab.model'
import { Router, ActivatedRoute } from '@angular/router';
import { MapService } from 'src/app/services/map/map.service';
import { CustomCoordinates } from 'src/app/models/coordinates';

@Component({
  selector: 'app-searchresults',
  templateUrl: './searchresults.component.html',
  styleUrls: ['./searchresults.component.scss']
})
export class SearchresultsComponent implements OnInit, OnDestroy {
  queryParams: {
    [key: string]: any
    query?: string
    lng?: number
    lat?: number
  } = null
  openTab: tab
  filterNumber: number
  loading: boolean = null
  fakeCenter: number[] = null
  @Input() select: number
  categoriesSet: any = null

  private _categoriesSet_sub: Subscription
  private returnTab: Subscription
  private returnTab_sub: Subscription
  private filter_sub: Subscription
  private fakeCenter_sub: Subscription
  private url_sub: Subscription
  
  constructor(
    private map: MapService,
    private SearchService: SearchService,
    private router: Router,
    private ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.url_sub = this.ActivatedRoute.queryParams.subscribe((params: {[key: string]: any}) => {
      this.queryParams = params
    })
    this.returnTab = this.SearchService.searchTab.subscribe((tab)=> this.openTab = tab)
    this._categoriesSet_sub= this.SearchService.categorySet.subscribe((set)=> this.categoriesSet = set)
    this.returnTab_sub = this.SearchService.searchTab.subscribe((tab) => {
      this.openTab = tab
    })
    this.filter_sub = this.SearchService.filterNumber.subscribe((number)=> this.filterNumber = number)
    this.fakeCenter_sub = this.SearchService.searchTab.subscribe((coord: number[])=> this.fakeCenter = coord)

    if (this.queryParams.query) {
      this.loading = true
      this.SearchService.enterSearch(this.queryParams.query, this.SearchService.mainSearch(this.queryParams.query, new CustomCoordinates(this.queryParams.lng, this.queryParams.lat)), new CustomCoordinates(this.queryParams.lng, this.queryParams.lat))
      .finally(()=>{
        this.loading = false
      })      
    }
  }

  checkFilter(type: number){
    // console.log(this.filterNumber)
    if (this.filterNumber === 0 || type === this.filterNumber){
      return true
    }
    else{
      return false
    }
  }
  
  checkIfChecked(id:string):boolean{
    if(this.categoriesSet.has(id)){
      return true
    }
    else{
      return false
    }
  }

  ngOnDestroy(){
    this.returnTab.unsubscribe()
    this._categoriesSet_sub.unsubscribe()
    this.filter_sub.unsubscribe()
    this.returnTab_sub.unsubscribe()
    this.fakeCenter_sub.unsubscribe()
    this.url_sub.unsubscribe()
  }
}
