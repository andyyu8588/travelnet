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
  fakeCenter: number[] = null
  private returnTab_sub: Subscription
  private fakeCenter_sub: Subscription
  @ViewChild('searchResultsContainer') div: ElementRef

  defaultFilter: any = 0

  constructor(
    private MapService: MapService,
    private Renderer : Renderer2,
    private router : Router,
    private SearchService: SearchService,
  ) { }

  ngOnInit(): void {
    this.returnTab_sub = this.SearchService.searchTab.subscribe((tab)=> this.openTab = tab)
    this.fakeCenter_sub = this.MapService.fakeCenter.subscribe((coord: number[])=> this.fakeCenter = coord)
    this.MapService.getFakeCenter(5)
    this.SearchService.updateCategories().then((x: {set: any, tree: any}) => {
      this.categories = x.tree
    })
  }

  onSubmit(data: string) {
    this.SearchService.enterSearch(data,this.SearchService.mainSearch(data, this.fakeCenter.toString()),this.fakeCenter.toString()).then(()=>{
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
      this.SearchService.mainSearch(data, this.MapService.getCenter().toString())
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
    this.returnTab_sub.unsubscribe()
    this.fakeCenter_sub.unsubscribe()
  }
}
