import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SearchService } from 'src/app/services/search.service'
import * as Mapboxgl from 'mapbox-gl'

@Injectable({
  providedIn: 'root'
})
export class MapService {
map: Mapboxgl.Map
  constructor(private searchService: SearchService) {
    Mapboxgl.accessToken = environment.mapbox
  }

  buildMap() {
    this.map = new Mapboxgl.Map({
    container: 'mapbox', // container id
    style: 'mapbox://styles/travelnet/ck99afyp80hhu1iqrodjf1brl',
    center: [54.5, 15.25], // starting position
    zoom: 2, // starting zoom
    failIfMajorPerformanceCaveat:true, //map creation will fail
    //if the performance of Mapbox GL JS
  });

    this.map.on('click',(e)=>{
      let lng = e.lngLat.lng
      let lag = e.lngLat.lat
      let lngLag: string =  lng +','+ lag
      console.log(lngLag)
      this.searchService.foursquareSearch(lngLag)
        .then(x => {
          console.log(x)
        })
        .catch(err => {
          console.log(err)
      })
    })
  }




}
