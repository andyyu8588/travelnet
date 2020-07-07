import { Component, OnInit, OnDestroy } from '@angular/core';
import { FoursquareService } from 'src/app/services/map/foursquare.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  completed: boolean
  name: string
  categories: any = null
  panelOpenState = false
  allComplete: Array<boolean> = null
  constructor(
    private SearchService: SearchService,
    private FoursquareService: FoursquareService
  ) { }

  ngOnInit(): void {
    this.SearchService.updateCategories().then(x=>{
      this.categories = x.response.categories
      console.log(this.categories)
      this.allComplete = new Array(this.categories.length).fill(true)
    })

  }

  updateAllComplete(i) {
    this.allComplete[i] = this.categories[i].categories != null && this.categories[i].categories.every(t => t.completed);
  }
  someComplete(i): boolean {
    if (this.categories[i].categories == null) {
      return false;
    }
    return this.categories[i].categories.filter(t=> t.completed).length > 0 && !this.allComplete[i];
  }
  setAll(i,completed: boolean) {
    this.allComplete[i] = completed;
    if (this.categories[i].categories == null) {
      return;
    }
    this.categories[i].categories.forEach(t => t.completed = completed);
  }


}
