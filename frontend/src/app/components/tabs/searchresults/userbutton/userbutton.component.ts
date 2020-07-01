import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userbutton',
  templateUrl: './userbutton.component.html',
  styleUrls: ['./userbutton.component.scss']
})
export class UserbuttonComponent implements OnInit {
  pathID: string
  searchResult : any
  @Input() result: any

  constructor(
    private searchservice: SearchService,
    private router : Router,
  ) { }

  ngOnInit(): void {
    this.searchResult = this.result
    this.pathID = '/search/user/' + this.result.username
  }
  navigate(){
    console.log(this.result)
    this.searchservice.updatePath(this.pathID)
    this.router.navigate([this.pathID])

  }

}
