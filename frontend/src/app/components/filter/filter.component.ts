import { Component, OnInit, OnDestroy } from '@angular/core';
import { FoursquareService } from 'src/app/services/map/foursquare.service';
import { SearchService } from 'src/app/services/search.service';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {BehaviorSubject, Observable, of as observableOf, Subscription} from 'rxjs';

interface CategoryNode {
  completed: boolean
  id: string;
  name: string;
  pluralName: string;
  shortName: string;
  icon: {
    prefix: string;
    suffix: string
  }
  categories?: CategoryNode[]
}

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
      x.map(d => {
        d['checked'] = false;
        d['expanded'] = false;
        return d;
      })
      this.categories = x
      console.log(this.categories)

      // this.allComplete = new Array(this.categories.length).fill(true)
    })
  }

  /** Checks if datasource for material tree has any child groups */
  hasChild = (_: number, node: CategoryNode) => !!node.categories && node.categories.length > 0;

  /** Returns child groups from security group */
  private _getChildren = (node: CategoryNode) => node.categories;

  clickedActive(element) {
    element.checked = !element.checked;
  }

  /** Loops recursively through data finding the amount of checked children */
  getCheckedAmount(node) {
    this.count = 0; // resetting count
    this.loopData(node.categories);
    return this.count;
  }

  /** Used by getCheckedAmount() */
  loopData(node) {
    node.forEach(d => {
      if (d.checked) {
        this.count += 1;
      }
      if (d.categories && d.categories.length > 0) {
        this.loopData(d.categories);
      }
    });
  }

  changeState(node) {
    node.expanded = !node.expanded;
  }

  // const directParent = ancestors[ancestors.length - 2];

  //returns an array if ordered ancestors for a given node
  getAncestors(categories, name) {
    if (typeof categories !== 'undefined') {
      for (let i = 0; i < categories.length; i++) {
        if (categories[i].name === name) {
          return [categories[i]];
        }
        const ancestors = this.getAncestors(categories[i].children, name);
        if (ancestors !== null) {
          ancestors.unshift(categories[i]);
          return ancestors;
        }
      }
    }
    return null;
  }
}
