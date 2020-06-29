import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { search } from '../../../../models/search.model'
import { Router } from '@angular/router';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  pathID: string
  searchResult : any
  @Input() result: any
  constructor (
    private searchservice: SearchService,
    private router : Router,) {
  }



  ngOnInit(): void {
    this.searchResult = this.result
    this.pathID = '/search/'+ this.result.type + '/' + this.result.Id
  }
  navigate(){
    this.searchservice.updatePath(this.pathID)
    this.router.navigate([this.pathID])

  }

}
