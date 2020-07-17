import { SearchParams } from './../../models/searchParams';
import { ActivatedRoute } from '@angular/router';
import { TripService } from './../../services/trip.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { CategoryNode} from 'src/app/models/CategoryNode.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {
  completed: boolean
  name: string
  panelOpenState = false

  categoriesTree: CategoryNode[] = null
  categoriesSet: any
  private categoriesTree_sub: Subscription
  private categoriesSet_sub: Subscription

  allComplete: Array<boolean> = null
  count = 0;

  treeControl = new NestedTreeControl<CategoryNode>(node => node.categories);

  private _selectedNodes: BehaviorSubject<string> = new BehaviorSubject(null)
  selectedNodes: Observable<string> = this._selectedNodes.asObservable()

  constructor(
    private SearchService: SearchService,
    private TripService: TripService,
    private ActivatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.categoriesTree_sub = this.SearchService.categoryTree.subscribe((tree)=> this.categoriesTree = tree)
    this.categoriesSet_sub = this.SearchService.categorySet.subscribe((set)=> this.categoriesSet = set)

    // sets category filter from url params
    this.ActivatedRoute.queryParams.subscribe((params: SearchParams) => {
      this.SearchService.updateCategories()
      .then((val: CategoryNode[]) => {
        this.categoriesTree = val
        if (params.category) {
          if (params.category === 'All') {
            null
          } else {
          this.categoriesTree.forEach((child: CategoryNode) => {
            if (child.name != params.category) {
              this.uncheckAll(child.categories)
            } else {
              this.checkAll(child.categories)
            }
          })              
          }
        }        
      })
      .catch(err => {
        console.log(err)
      })
    }) 

    if (this.TripService.searchedCategory) {
      // modify filter settings
      this.setAll(this.TripService.searchedCategory)
    }
  }

  /** Checks if datasource for material tree has any child groups */
  hasChild = (_: number, node: CategoryNode) => !!node.categories && node.categories.length > 0;

  /**toggle checkmark for leafs */
  clickedActive(element: CategoryNode) {
    element.checked = !element.checked;
    this.modifyIdSet(element)
    this.SearchService.updateCategoryTree(this.categoriesTree)
  }

  /**toggle checkmark for nodes && node itself */
  setAll(category: CategoryNode) {
    let allChecked = this.initiateChildrenChecker(category.categories)
    if(!allChecked) {
      this.SearchService.treeValues.categorySet.has(category.id)? null : this.SearchService.treeValues.categorySet.add(category.id)
      this.checkAll(category.categories)
    }
    else if (allChecked) {
      this.SearchService.treeValues.categorySet.has(category.id)? this.SearchService.treeValues.categorySet.delete(category.id) : null
      this.uncheckAll(category.categories)
    }
    this.SearchService.updateCategoryTree(this.categoriesTree)
  }

  /** checks all children of a node && node itself */
  checkAll(categories: CategoryNode[]) {
    categories.forEach((sub: CategoryNode) => {
      sub.checked = true;
      this.SearchService.treeValues.categorySet.has(sub.id)? null : this.SearchService.treeValues.categorySet.add(sub.id)

      this.SearchService.updateCategorySet(this.categoriesSet)
      // this.modifyIdSet(sub)

      if (sub.categories && sub.categories.length > 0) {
        this.checkAll(sub.categories)
      }
    })
  }

  /** unchecks all children of a node */
  uncheckAll(categories: CategoryNode[]) {
    categories.forEach((sub: CategoryNode) => {
      sub.checked = false;
      this.SearchService.treeValues.categorySet.has(sub.id)? this.SearchService.treeValues.categorySet.delete(sub.id) : null

      // this.modifyIdSet(sub)
      if(sub.categories && sub.categories.length > 0){
        this.uncheckAll(sub.categories)
      }
    });
  }

  /**initiates allChildrenChecked() */
  initiateChildrenChecker(categories: CategoryNode[]): boolean{
    var state = true
    state = this.allChildrenChecked(categories, state)
    return state
  }

  /** returns false if at least one child is unchecked*/
  allChildrenChecked(categories: CategoryNode[], state: boolean): boolean {
    categories.forEach((child: CategoryNode) => {
      if (!state) {
        return state
      }
      else if (state && child.categories && child.categories.length > 0) {
        state = this.allChildrenChecked(child.categories, state)
      }
      else if (!child.checked) {
        state = false
        return state
      }
    })
    return state
  }

  /**initiates atLeastOneChecked() */
  initiateAtLeastOneChecked(categories: CategoryNode[]): boolean {
    var state = false;
    state = this.atLeastOneChecked(categories, state);
    return state
  }

  /** returns true if at least one child is checked*/
  atLeastOneChecked(categories: CategoryNode[], state: boolean): boolean {
    categories.forEach((child: CategoryNode) => {
      if (state) {
        return state
      }
      else if (!state && child.categories && child.categories.length > 0) {
        state = this.atLeastOneChecked(child.categories, state)
      }
      else if (child.checked) {
        state = true
        return state
      }
    })
    return state
  }

  /**accepts leaf node, and either removes it or adds it to the array */
  modifyIdSet(node: CategoryNode){
    if(node.checked && !(this.categoriesSet).has(node.id) && node.categories.length === 0){
      this.categoriesSet.add(node.id)
    }else if(!node.checked && this.categoriesSet.has(node.id) && node.categories.length === 0){
      this.categoriesSet.delete(node.id)
    }
    this.SearchService.updateCategorySet(this.categoriesSet)
  }

  ngOnDestroy(){
    this.SearchService.updateCategoryTree(this.categoriesTree)
    this.categoriesTree_sub.unsubscribe()
    this.categoriesSet_sub.unsubscribe()
  }
}
