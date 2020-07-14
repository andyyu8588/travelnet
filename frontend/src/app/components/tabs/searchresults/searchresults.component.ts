import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { tab } from 'src/app/models/tab.model'
import { Router } from '@angular/router';
import { MapService } from 'src/app/services/map/map.service';

@Component({
  selector: 'app-searchresults',
  templateUrl: './searchresults.component.html',
  styleUrls: ['./searchresults.component.scss']
})
export class SearchresultsComponent implements OnInit, OnDestroy {
  url: string = null
  urlQuery: string = null
  urlLatLng: string = null
  openTab: tab
  filterNumber: number
  loading: boolean = true
  fakeCenter: number[] = null
  @Input() select: number
  categoriesSet: any = null

  private _categoriesSet_sub: Subscription
  private returnTab: Subscription
  private returnTab_sub: Subscription
  private filter_sub: Subscription
  private fakeCenter_sub: Subscription
  
  constructor(
    private map: MapService,
    private SearchService: SearchService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.returnTab = this.SearchService.searchTab.subscribe((tab)=> this.openTab = tab)
    this._categoriesSet_sub= this.SearchService.categorySet.subscribe((set)=> this.categoriesSet = set)
    this.returnTab_sub = this.SearchService.searchTab.subscribe((tab) => {
      console.log(tab)
      this.openTab = tab
    })
    this.filter_sub = this.SearchService.filterNumber.subscribe((number)=> this.filterNumber = number)
    this.fakeCenter_sub = this.SearchService.searchTab.subscribe((coord: number[])=> this.fakeCenter = coord)
    this.url = this.router.url.replace('/search/','')
    this.urlQuery = this.url.split("&")[0]
    this.urlLatLng = this.url.split("&")[1]
    this.SearchService.enterSearch(this.urlQuery,this.SearchService.mainSearch(this.urlQuery,this.urlLatLng),this.urlLatLng).then(()=>{
      this.loading = false
    })

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
  }
}
