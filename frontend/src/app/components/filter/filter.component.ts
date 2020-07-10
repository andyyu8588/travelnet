import { Component, OnInit, OnDestroy } from '@angular/core';
import { FoursquareService } from 'src/app/services/map/foursquare.service';
import { SearchService } from 'src/app/services/search.service';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {BehaviorSubject, Observable, of as observableOf, Subscription} from 'rxjs';
import { CategoryNode, CategoryFlatNode } from 'src/app/models/CategoryNode.model';

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
  count = 0;

  treeControl = new NestedTreeControl<CategoryNode>(node => node.categories);
  dataSource = new MatTreeNestedDataSource<CategoryNode>();

  constructor(
    private SearchService: SearchService,
  ) { }

  ngOnInit(): void {
    this.SearchService.updateCategories()
    .then(x => {
      this.categories = x
      console.log(this.categories)

      // this.allComplete = new Array(this.categories.length).fill(true)
    })
  }

  /** Checks if datasource for material tree has any child groups */
  hasChild = (_: number, node: CategoryNode) => !!node.categories && node.categories.length > 0;

  /** Returns child groups from security group */
  private _getChildren = (node: CategoryNode) => node.categories;


  /**toggle clicks checkmarks */
  clickedActive(element) {
    element.checked = !element.checked;
    console.log(this.categories[1].categories)
    console.log(this.allChildrenChecked((this.categories[1].categories)))
    console.log(this.atLeastOneChecked(this.categories[1].categories))
  }
  /**makes all children nodes of a parent node checked when checked, and the opposite if need be */
  setAll(category) {
    category.checked = !category.checked;
    if(category.checked) {
      this.checkAll(category.categories)
    }
    else if (!category.checked){
      this.uncheckAll(category.categories)
    }
    console.log(this.categories[1].categories)
    console.log(this.allChildrenChecked((this.categories[1].categories)))
    console.log(this.atLeastOneChecked(this.categories[1].categories))
  }
  /** checks all children of a node */
  checkAll(categories){
      categories.forEach(sub => {
      sub.checked = true;
      if(sub.categories && sub.categories.length > 0){
        sub.checked = true;
        this.checkAll(sub.categories)
      }
  });

  }
  /** unchecks all children of a node */
  uncheckAll(categories){
      categories.forEach(sub => {
        sub.checked = false;
        if(sub.categories && sub.categories.length > 0){
          sub.checked = false;
          this.uncheckAll(sub.categories)
        }
    });
  }

  /** returns false if at least one child is unchecked*/
  allChildrenChecked(categories: CategoryNode[]): boolean {
    let state: boolean = true
    categories.forEach((child: CategoryNode) => {
      if (child.categories.length > 0){
        this.allChildrenChecked(child.categories)
      }
      else{
        if(!child.checked){
          state = false
          return state
        }
      }
    })
    return state
  }

  /** returns true if at least one child is checked*/
  atLeastOneChecked(categories: CategoryNode[]): boolean {
    let state: boolean = false
    categories.forEach((child: CategoryNode) => {
      if (child.categories.length > 0){
        this.atLeastOneChecked(child.categories)
      }
      else{
        if(child.checked){
          state = true
          return state
        }
      }
    })
    return state
  }
}
