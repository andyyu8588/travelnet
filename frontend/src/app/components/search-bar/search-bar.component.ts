import { Component, OnInit, Renderer2, OnDestroy, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, AfterContentInit, AfterContentChecked } from '@angular/core';
import { MapService } from 'src/app/services/map/map.service';
import { Router } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { tab } from 'src/app/models/tab.model';
import { Subscription } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { FoursquareService } from 'src/app/services/map/foursquare.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  loading: boolean = false
  private child: HTMLParagraphElement

  openTab: tab
  private returnTab: Subscription
  @ViewChild('searchResultsContainer') div: ElementRef

  defaultFilter: any = 0

  constructor(
    private map: MapService,
    private Renderer : Renderer2,
    private router : Router,
    private SearchService: SearchService,
    private FoursquareService: FoursquareService
  ) {
  }

  ngOnInit(): void {
    this.returnTab = this.SearchService.searchTab.subscribe((tab)=> this.openTab = tab)
  }


  onSubmit(data: string) {
    this.SearchService.enterSearch(data,this.SearchService.mainSearch(data, this.map.getCenter())).then(()=>{
    this.router.navigate([this.openTab.path])
    })
  }

  changeFilter(filter:{response:string, value:string}){
    console.log(filter)
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
  }


}
