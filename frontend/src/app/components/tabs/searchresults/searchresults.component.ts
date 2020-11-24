import { SearchParams } from './../../../models/searchParams'
import { Component, OnInit, OnDestroy, Input } from '@angular/core'
import { Subscription } from 'rxjs'
import { SearchService } from 'src/app/services/search.service'
import { tab } from 'src/app/models/tab.model'
import { ActivatedRoute } from '@angular/router'
import { MapService } from 'src/app/services/map/map.service'
import { CustomCoordinates } from 'src/app/models/coordinates'

@Component({
  selector: 'app-searchresults',
  templateUrl: './searchresults.component.html',
  styleUrls: ['./searchresults.component.scss']
})
export class SearchresultsComponent implements OnInit, OnDestroy {
  queryParams: SearchParams = {}
  openTab: tab
  filterNumber: number
  loading: boolean = null
  @Input() select: number
  categoriesSet: Set<any> = null

  private _categoriesSet_sub: Subscription
  private returnTab_sub: Subscription
  private filter_sub: Subscription

  constructor(
    private map: MapService,
    private SearchService: SearchService,
    private ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true

    // search parameters
    this.ActivatedRoute.queryParams.subscribe((params: SearchParams) => {
      this.queryParams = params
    })
    this.filter_sub = this.SearchService.filterNumber.subscribe((number) => this.filterNumber = number)

    // response from http queries
    this.returnTab_sub = this.SearchService.searchTab.subscribe((tab: tab) => {
      this.openTab = tab
      this.loading = false
    })

    this._categoriesSet_sub = this.SearchService.categorySet.subscribe((set: Set<any>) => {
      if (set) {
        this.categoriesSet = set
      }
    })
  }

  /** check if state of venues|users filter */
  checkFilter(type: number) {
    if (this.filterNumber === 0 || type === this.filterNumber){
      return true
    }
    else{
      return false
    }
  }

  checkIfChecked(id: string): boolean {
    if (this.categoriesSet.has(id)) {
      return true
    }
    else {
      return false
    }
  }

  ngOnDestroy() {
    this._categoriesSet_sub.unsubscribe()
    this.filter_sub.unsubscribe()
    this.returnTab_sub.unsubscribe()
  }
}
