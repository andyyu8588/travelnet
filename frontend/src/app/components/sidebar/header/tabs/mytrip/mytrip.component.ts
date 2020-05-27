import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mytrip',
  templateUrl: './mytrip.component.html',
  styleUrls: ['./mytrip.component.scss']
})
export class MytripComponent implements OnInit {
  @Input() name: String = "Sample Trip"
  @Input() places: Array<any> = []

  constructor() { }

  ngOnInit(): void {
  }

}
