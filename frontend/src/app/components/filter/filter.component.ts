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
  /**toggle clicks checkmarks */
  clickedActive(element) {
    element.checked = !element.checked;
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
  /**solution to current problem: when all children node of a parent node are unclicked, parent seems still to be clicked,
   * the following code is intentioned to fix this problem, but are not yet applied,
   * working theory is that on every child unchecked, must check if all children are unchecked, if so, check if
   * parent is unchecked, if not, must uncheck parent
   */
  /**makes parent component of checked children checked */
  setParentChecked(category:CategoryNode){
    if(this.initiateChildrenChecker(category.categories)){
      category.checked = true
    }
  }
  /**find parent node of given child node */
  findParentNodeofChildNode(childNode:CategoryNode,categories: CategoryNode[]):CategoryNode[]{
    let parentNode = categories
    this.categories.forEach(node => {
      if (parentNode.includes(childNode)){
        return parentNode
      }
      else{
        if(node.categories && node.categories.length > 0){
          parentNode = this.findParentNodeofChildNode(node.categories,parentNode)
        }
      }
    })
    return parentNode
  }
}
