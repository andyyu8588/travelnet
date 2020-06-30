import { MapService } from 'src/app/services/map/map.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { search } from '../../../../models/search.model'
import { Router } from '@angular/router';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  pathID: string
  searchResult : any
  @Input() result: any
  constructor (
    private searchservice: SearchService,
    private router : Router,
    private MapService: MapService) {
  }

  ngOnInit(): void {
    this.searchResult = this.result
    this.pathID = '/search/'+ this.result.type + '/' + this.result.Id


  }
  navigate(){
    this.searchservice.updatePath(this.pathID)
    this.router.navigate([this.pathID])

  }

  showLocation() {
    this.MapService.addMarker(this.result.location)
  }

  ngOnDestroy() {
    this.MapService.venueOnDestroy()
  }
}
