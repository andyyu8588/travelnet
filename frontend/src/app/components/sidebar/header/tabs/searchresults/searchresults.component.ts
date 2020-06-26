import { Component, OnInit, OnDestroy, Renderer2, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { tab } from '../../../tab.model'
import { MapService } from 'src/app/services/map/map.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-searchresults',
  templateUrl: './searchresults.component.html',
  styleUrls: ['./searchresults.component.scss']
})
export class SearchresultsComponent implements OnInit,OnDestroy {
  constructor(private SearchService : SearchService,
              private map: MapService,
              private Renderer : Renderer2,) {}
  loading: boolean = false
  private child: HTMLParagraphElement
  searches: any
  openTabs: tab[] = []
  private returnTabs: Subscription
  @ViewChild('searchResultsContainer') div: ElementRef


  ngOnInit(): void {
  this.returnTabs = this.SearchService.searchTab.subscribe((tabs)=> this.openTabs = tabs)
  }



  onSubmit(data: string) {

    this.SearchService.newSeach(data, this.map.getCenter(),0)

    // this.openTabs.forEach(element => {
    //   if (element.query == data.toLowerCase()){
    //     console.log(element.content)
    //     this.searches = element.content
    //   }
    // });
  }

  onKey(data: string) {
    if (data === "") {
        this.loading = false
    } else {
        this.loading = true
        // this.SearchService.foursquareSearch(data,this.map.getCenter())
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
    this.returnTabs.unsubscribe()
  }
}
