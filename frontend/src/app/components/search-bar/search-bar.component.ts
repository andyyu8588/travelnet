import { Component, OnInit, Renderer2, OnDestroy,ViewChild, ElementRef } from '@angular/core';
import { MapService } from 'src/app/services/map/map.service';
import { Router } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { tab } from 'src/app/components/tabs/tab.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {

  constructor(
    private map: MapService,
    private Renderer : Renderer2,
    private router : Router,
    private SearchService: SearchService
  ) { }
  loading: boolean = false
  private child: HTMLParagraphElement
  openTab: tab
  private returnTab: Subscription
  @ViewChild('searchResultsContainer') div: ElementRef

  ngOnInit(): void {
    this.returnTab = this.SearchService.searchTab.subscribe((tab)=> this.openTab = tab)
  }


  onSubmit(data: string) {

    this.SearchService.newSeach(data, this.map.getCenter()).then(()=>{
    this.router.navigate([this.openTab.path])
    console.log(this.openTab.content)
    })
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
    this.returnTab.unsubscribe()
  }


}
