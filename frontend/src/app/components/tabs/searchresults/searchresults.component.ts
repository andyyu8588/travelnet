import { Component, OnInit, OnDestroy, AfterViewInit, AfterViewChecked, Input } from '@angular/core';
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
  fakeCenter: any = null
  @Input() select: number
  categoriesSet: any = null

  private _categoriesSet: Subscription
  private returnTab: Subscription
  private filter: Subscription
  private _fakeCenter: Subscription
  constructor(
    private map: MapService,
    private SearchService: SearchService,
    private router: Router
  ) {}



  ngOnInit(): void {
    this.returnTab = this.SearchService.searchTab.subscribe((tab)=> this.openTab = tab)
    console.log(this.openTab)
    this.filter = this.SearchService.filterNumber.subscribe((number)=> this.filterNumber = number)
    this._fakeCenter = this.SearchService.searchTab.subscribe((center)=> this.fakeCenter = center)
    this._categoriesSet= this.SearchService.categorySet.subscribe((set)=> this.categoriesSet = set)
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
    this.filter.unsubscribe()
    this.returnTab.unsubscribe()
    this._fakeCenter.unsubscribe()
    this._categoriesSet.unsubscribe()
  }
}
