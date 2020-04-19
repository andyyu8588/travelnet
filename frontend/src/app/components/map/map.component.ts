import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
session:boolean = this.sessionService.session()
  constructor(private sessionService:SessionService) { }

  ngOnInit(): void {
  }

}
