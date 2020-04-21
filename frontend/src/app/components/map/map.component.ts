import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { environment } from 'src/environments/environment';

import * as Mapboxgl from 'mapbox-gl'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  session: boolean = this.sessionService.session()
  map: Mapboxgl.Map

  constructor(private sessionService:SessionService) {

  }

  ngOnInit(): void {

    Mapboxgl.accessToken = environment.mapbox

    this.map = new Mapboxgl.Map({
      container: 'mapbox', // container id
      style: 'mapbox://styles/travelnet/ck999d60d0ntr1jpmyv5losin',
      center: [-74.5, 40], // starting position
      zoom: 9 // starting zoom
    });
    
    // Add zoom and rotation controls to the map.
    this.map.addControl(new Mapboxgl.NavigationControl());
  }
}
