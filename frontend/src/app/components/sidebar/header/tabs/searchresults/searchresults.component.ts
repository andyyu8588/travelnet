import { Component, OnInit, OnDestroy, Renderer2, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { tab } from '../../../tab.model'
import { MapService } from 'src/app/services/map/map.service';
import { SearchService } from 'src/app/services/search.service';
import { SocketService } from 'src/app/services/chatsystem/socket.service';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service'
@Component({
  selector: 'app-searchresults',
  templateUrl: './searchresults.component.html',
  styleUrls: ['./searchresults.component.scss']
})
export class SearchresultsComponent implements OnInit,OnDestroy {
  constructor(private sessionService:SessionService,
              private SearchService : SearchService,
              private SocketService: SocketService,
              private map: MapService,
              private router: Router,
              private Renderer : Renderer2,) {}
  loading: boolean = false
  private child: HTMLParagraphElement
  searches
  openTabs: tab[] = []
  private returnTabs: Subscription
  @ViewChild('searchResultsContainer') div: ElementRef


  ngOnInit(): void {
  this.returnTabs = this.SearchService.searchTabs.subscribe((tabs)=> this.openTabs = tabs)
  this.openTabs.forEach(e=>{
    if (e.title){
      console.log('ji')
    }})
  }



  onSubmit(data: string) {
    this.SearchService.newSeach(data, this.map.getCenter(),0)
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
