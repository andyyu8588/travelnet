import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-comp1',
  templateUrl: './comp1.component.html',
  styleUrls: ['./comp1.component.scss']
})
export class Comp1Component implements OnInit {

  comp1arr: Array<string> = ['boom','skra','papap']

  constructor() { }

  ngOnInit(): void {
  }

}
