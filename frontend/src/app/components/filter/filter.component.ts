import { Component, OnInit, OnDestroy } from '@angular/core';
import { FoursquareService } from 'src/app/services/map/foursquare.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  categories: any
  panelOpenState = false;

  constructor(
    private SearchService: SearchService,
    private FoursquareService: FoursquareService
  ) { }


  ngOnInit(): void {
    this.SearchService.updateCategories().then(x=>{
      this.categories = x.response.categories
      console.log(this.categories)
    })
  }


}
