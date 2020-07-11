import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import { CategoryNode} from 'src/app/models/CategoryNode.model';

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
    })
  }

  /** Checks if datasource for material tree has any child groups */
  hasChild = (_: number, node: CategoryNode) => !!node.categories && node.categories.length > 0;
  /**toggle clicks checkmarks */
  clickedActive(element) {
    element.checked = !element.checked;
  }
  /**makes all children nodes of a parent node checked when checked, and the opposite if need be */
  setAll(category) {
    let allChecked = this.initiateChildrenChecker(category.categories)
    if(!allChecked) {
      this.checkAll(category.categories)
    }
    else if (allChecked){
      this.uncheckAll(category.categories)
    }
  }
  /** checks all children of a node */
  checkAll(categories){
      categories.forEach(sub => {
      sub.checked = true;
      if(sub.categories && sub.categories.length > 0){
        this.checkAll(sub.categories)
      }
  });

  }
  /** unchecks all children of a node */
  uncheckAll(categories){
      categories.forEach(sub => {
        sub.checked = false;
        if(sub.categories && sub.categories.length > 0){
          this.uncheckAll(sub.categories)
        }
    });
  }
  /**initiates allChildrenChecked() */
  initiateChildrenChecker(categories: CategoryNode[]): boolean{
    var state = true;
    state = this.allChildrenChecked(categories, state);
    return state
  }
  /** returns false if at least one child is unchecked*/
  allChildrenChecked(categories: CategoryNode[], state: boolean): boolean {
    categories.forEach((child: CategoryNode) => {
      if (!state){
        return state
      }
      else if (state && child.categories && child.categories.length > 0){
        state = this.allChildrenChecked(child.categories, state)
      }
      else if(!child.checked){
        state = false
        return state
      }
    })
    return state
  }
  /**initiates atLeastOneChecked() */
  initiateAtLeastOneChecked(categories: CategoryNode[]): boolean{
    var state = false;
    state = this.atLeastOneChecked(categories, state);
    return state
  }

  /** returns true if at least one child is checked*/
  atLeastOneChecked(categories: CategoryNode[], state: boolean): boolean {
    categories.forEach((child: CategoryNode) => {
      if(state){
        return state
      }
      else if (!state && child.categories && child.categories.length > 0){
        state = this.atLeastOneChecked(child.categories, state)
      }
      else if(child.checked){
        state = true
        return state
      }
    })
    return state
  }
}
