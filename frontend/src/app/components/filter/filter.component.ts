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
    console.log(this.categories)
    element.checked = !element.checked;
  }
  /**makes all children nodes of a parent node checked when checked, and the opposite if need be */
  setAll(category) {
    // console.log(category)
    category.checked = !category.checked;
    if(category.checked) {
      this.checkAll(category.categories)
    }
    else if (!category.checked){
      this.uncheckAll(category.categories)
    }
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

  /** returns false if node has unchecked children, and true if all children are checked */
  childrenChecked(categories: CategoryNode[]): boolean {
    // if (node.categories) {
      categories.forEach((node: CategoryNode) => {
        if (node.checked) {
          if (node.categories && node.categories.length > 0) {
            this.childrenChecked(node.categories)
          }
          else{
            if (node.checked) {
            } else {
              return false
            }
          }
        } else {
          return false
        }
      })
      return true
    // }
    //if it is a leaf
    //problem: returns value too quickly
    // else {
    //   if (node.checked) {
    //     return true
    //   } else {
    //     return false
    //   }
    // }
  }


}
