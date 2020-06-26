import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FoursquareService } from 'src/app/services/map/foursquare.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.scss']
})
export class VenueComponent implements OnInit {
  url :string = null
  content : any
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private Foursquare: FoursquareService,
    private SearchService: SearchService
  ) { }

  ngOnInit(): void {
    this.url = this.router.url.replace('/search/venue/','')
    this.SearchService.formatDetails(this.url).then(result=>{
      this.content = result.response.venue
    })

  }

}
