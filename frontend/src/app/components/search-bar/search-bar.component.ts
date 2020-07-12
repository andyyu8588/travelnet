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
  private child: HTMLParagraphElement

  categories: CategoryNode[]
  openTab: tab
  fakeCenter: any = null
  private returnTab: Subscription
  private _fakeCenter: Subscription
  @ViewChild('searchResultsContainer') div: ElementRef

  defaultFilter: any = 0

  constructor(
    private map: MapService,
    private Renderer : Renderer2,
    private router : Router,
    private SearchService: SearchService,
  ) { }

  ngOnInit(): void {
    this.returnTab = this.SearchService.searchTab.subscribe((tab)=> this.openTab = tab)
    this._fakeCenter = this.map.center.subscribe((center)=> this.fakeCenter = center)
    this.map.getFakeCenter(5)
    this.SearchService.updateCategories().then((x: {set: any, tree: any}) => {
      this.categories = x.tree
    })
  }

  onSubmit(data: string) {
    this.SearchService.enterSearch(data,this.SearchService.mainSearch(data, this.fakeCenter),this.fakeCenter).then(()=>{
      this.router.navigate([this.openTab.path])
    })
  }

  changeFilter(filter:{response:string, value:string}){
    this.SearchService.changeFilter(parseInt(filter.value))
  }

  onKey(data: string) {
    if (data === "") {
      this.loading = false
    } else {
      this.loading = true
      this.SearchService.mainSearch(data, this.map.getCenter())
      .then((finalData) => {
        this.loading = false
        this.Renderer.removeChild(this.div, this.child)
        this.child = this.Renderer.createElement('p');
        this.child.innerHTML = finalData[1]
        this.Renderer.appendChild(this.div.nativeElement, this.child)
      })
      .catch((err) => {
        this.loading = false
      })
    }
  }

  ngOnDestroy(){
    this.returnTab.unsubscribe()
    this._fakeCenter.unsubscribe()
  }
}
