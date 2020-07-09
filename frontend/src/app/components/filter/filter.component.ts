import { CategoryNode } from './../../models/CategoryNode.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FoursquareService } from 'src/app/services/map/foursquare.service';
import { SearchService } from 'src/app/services/search.service';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {BehaviorSubject, Observable, of as observableOf, Subscription} from 'rxjs';

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
      // x.map(d => {
      //   d['checked'] = true;
      //   d['expanded'] = false;
      //   return d;
      // })
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
    console.log(element)
  }

  /** returns false if node has unchecked children, and true if all children are checked */
  childrenChecked(node: CategoryNode): boolean {
    // console.log(node)
    if (node.categories) {
      node.categories.forEach((element: CategoryNode) => {
        if (element.checked) {
          if (element.categories) {
            this.childrenChecked(element)
          }
        } else {
          return false
        }
      })
    } else {
      if (node.checked) {
        return true
      } else {
        return false
      }
    }
  }

}
